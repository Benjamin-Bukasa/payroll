import prisma from "../config/db.js";
import { PLAN_LIMITS } from "../utils/subscription.js";
import { createAuditLog } from "../services/audit.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(
  __dirname,
  "..",
  "..",
  "uploads",
  "company-logos"
);

const buildPublicPath = (filename) =>
  `/uploads/company-logos/${filename}`;

const extractPublicPath = (value) => {
  if (!value) return null;
  if (value.startsWith("http")) {
    try {
      const parsed = new URL(value);
      return parsed.pathname;
    } catch {
      return null;
    }
  }
  return value;
};

const getAbsolutePath = (publicPath) => {
  if (!publicPath) return null;
  const fileName = path.basename(publicPath);
  return path.join(uploadDir, fileName);
};

const removeFileIfExists = async (publicPath) => {
  const normalizedPath = extractPublicPath(publicPath);
  if (
    !normalizedPath ||
    !normalizedPath.startsWith("/uploads/company-logos/")
  ) {
    return;
  }

  const absolutePath = getAbsolutePath(normalizedPath);
  if (!absolutePath) return;

  try {
    await fs.promises.unlink(absolutePath);
  } catch {
    // ignore delete errors
  }
};

export const getMyCompany = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: true,
        _count: { select: { users: true } },
      },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const rawLimit = company.subscription
      ? PLAN_LIMITS[company.subscription.plan]
      : 0;
    const planLimit =
      rawLimit === Infinity ? null : rawLimit;

    res.json({
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
      idNat: company.idNat,
      rccm: company.rccm,
      numImpot: company.numImpot,
      logo: company.logo,
      sector: company.sector,
      devise: company.devise,
      subscription: company.subscription,
      userCount: company._count.users,
      planLimit,
      unlimitedUsers: rawLimit === Infinity,
      createdAt: company.createdAt,
    });
  } catch (error) {
    console.error("Get company error:", error);
    res.status(500).json({
      message: "Unable to fetch company",
    });
  }
};

export const updateMyCompany = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const existing = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const data = {};
    const fields = [
      "name",
      "email",
      "phone",
      "address",
      "idNat",
      "rccm",
      "numImpot",
      "sector",
      "devise",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (["idNat", "rccm", "numImpot"].includes(field)) {
          const value = String(req.body[field]).trim();
          data[field] = value.length ? value : null;
        } else {
          data[field] = String(req.body[field]).trim();
        }
      }
    });

    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.company.findFirst({
        where: { email: data.email },
      });
      if (emailTaken) {
        return res.status(400).json({
          message: "Email already used",
        });
      }
    }

    const updated = await prisma.company.update({
      where: { id: companyId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        idNat: true,
        rccm: true,
        numImpot: true,
        logo: true,
        sector: true,
        devise: true,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "UPDATE_COMPANY",
      entity: "Company",
      entityId: companyId,
    });

    res.json({
      message: "Company updated",
      company: updated,
    });
  } catch (error) {
    console.error("Update company error:", error);
    res.status(500).json({
      message: "Unable to update company",
    });
  }
};

export const updateMyCompanyLogo = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { logo: true },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    if (!req.file?.filename) {
      return res.status(400).json({
        message: "Logo file is required",
      });
    }

    const publicPath = buildPublicPath(req.file.filename);
    const publicUrl = `${req.protocol}://${req.get(
      "host"
    )}${publicPath}`;

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: { logo: publicUrl },
      select: { id: true, logo: true },
    });

    await removeFileIfExists(company.logo);

    await createAuditLog({
      userId: req.user.id,
      action: "UPDATE_COMPANY_LOGO",
      entity: "Company",
      entityId: companyId,
    });

    res.json({
      message: "Company logo updated",
      logo: updated.logo,
    });
  } catch (error) {
    console.error("Update company logo error:", error);
    res.status(500).json({
      message: "Unable to update company logo",
    });
  }
};
