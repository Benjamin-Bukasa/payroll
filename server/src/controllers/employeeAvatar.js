import prisma from "../config/db.js";
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
  "employee-avatars"
);

const buildPublicPath = (filename) =>
  `/uploads/employee-avatars/${filename}`;

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
    !normalizedPath.startsWith("/uploads/employee-avatars/")
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

const ensureEmployeeAccess = (employee, req, res) => {
  if (
    !employee ||
    employee.clientCompany.companyId !== req.user.companyId
  ) {
    res.status(404).json({ message: "Employee not found" });
    return false;
  }

  if (
    req.user.role === "MANAGER" &&
    employee.clientCompany.managerId !== req.user.id
  ) {
    res.status(403).json({ message: "Access denied" });
    return false;
  }

  return true;
};

/**
 * =========================
 * GET EMPLOYEE AVATAR
 * =========================
 */
export const getEmployeeAvatar = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { clientCompany: true },
    });

    if (!ensureEmployeeAccess(employee, req, res)) {
      return;
    }

    res.json({ avatar: employee.avatar });
  } catch (error) {
    console.error("Get employee avatar error:", error);
    res.status(500).json({
      message: "Unable to fetch employee avatar",
    });
  }
};

/**
 * =========================
 * UPDATE EMPLOYEE AVATAR
 * =========================
 */
export const updateEmployeeAvatar = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { clientCompany: true },
    });

    if (!ensureEmployeeAccess(employee, req, res)) {
      return;
    }

    if (!req.file?.filename) {
      return res.status(400).json({
        message: "Avatar file is required",
      });
    }

    const publicPath = buildPublicPath(req.file.filename);
    const publicUrl = `${req.protocol}://${req.get(
      "host"
    )}${publicPath}`;
    const previousAvatar = employee.avatar;

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: { avatar: publicUrl },
      select: { id: true, avatar: true },
    });

    await removeFileIfExists(previousAvatar);

    await createAuditLog({
      userId: req.user.id,
      action: "UPDATE_EMPLOYEE_AVATAR",
      entity: "Employee",
      entityId: employeeId,
    });

    res.json({
      message: "Avatar updated",
      avatar: updated.avatar,
    });
  } catch (error) {
    console.error("Update employee avatar error:", error);
    res.status(500).json({
      message: "Unable to update avatar",
    });
  }
};

/**
 * =========================
 * DELETE EMPLOYEE AVATAR
 * =========================
 */
export const deleteEmployeeAvatar = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { clientCompany: true },
    });

    if (!ensureEmployeeAccess(employee, req, res)) {
      return;
    }

    const previousAvatar = employee.avatar;

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: { avatar: null },
      select: { id: true, avatar: true },
    });

    await removeFileIfExists(previousAvatar);

    await createAuditLog({
      userId: req.user.id,
      action: "DELETE_EMPLOYEE_AVATAR",
      entity: "Employee",
      entityId: employeeId,
    });

    res.json({
      message: "Avatar deleted",
      avatar: updated.avatar,
    });
  } catch (error) {
    console.error("Delete employee avatar error:", error);
    res.status(500).json({
      message: "Unable to delete avatar",
    });
  }
};
