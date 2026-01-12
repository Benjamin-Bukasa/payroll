import prisma from "../config/db.js";
import { createAuditLog } from "../services/audit.js";

/* ======================================================
   CREATE CLIENT COMPANY
====================================================== */
export const createClientCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      phone,
      idNat,
      rccm,
      numImpot,
    } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        message: "name and address are required",
      });
    }

    const clientCompany = await prisma.clientCompany.create({
      data: {
        name,
        email,
        address,
        phone,
        idNat,
        rccm,
        numImpot,
        companyId: req.user.companyId,
      },
    });

    // 🔁 Créer automatiquement le schedule
    await prisma.clientCompanySchedule.create({
      data: {
        clientCompanyId: clientCompany.id,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_CLIENT_COMPANY",
      entity: "ClientCompany",
      entityId: clientCompany.id,
    });

    res.status(201).json(clientCompany);
  } catch (error) {
    console.error("Create ClientCompany error:", error);
    res.status(500).json({
      message: "Unable to create client company",
    });
  }
};

/* ======================================================
   LIST CLIENT COMPANIES (BY COMPANY)
====================================================== */
export const listClientCompanies = async (req, res) => {
  try {
    const companies = await prisma.clientCompany.findMany({
      where: {
        companyId: req.user.companyId,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(companies);
  } catch (error) {
    console.error("List ClientCompanies error:", error);
    res.status(500).json({
      message: "Unable to fetch client companies",
    });
  }
};

/* ======================================================
   GET ONE CLIENT COMPANY
====================================================== */
export const getClientCompanyById = async (req, res) => {
  try {
    const { clientCompanyId } = req.params;

    const clientCompany = await prisma.clientCompany.findUnique({
      where: { id: clientCompanyId },
      include: {
        schedule: true,
      },
    });

    if (
      !clientCompany ||
      clientCompany.companyId !== req.user.companyId
    ) {
      return res.status(404).json({
        message: "Client company not found",
      });
    }

    res.json(clientCompany);
  } catch (error) {
    console.error("Get ClientCompany error:", error);
    res.status(500).json({
      message: "Unable to fetch client company",
    });
  }
};

/* ======================================================
   UPDATE CLIENT COMPANY
====================================================== */
export const updateClientCompany = async (req, res) => {
  try {
    const { clientCompanyId } = req.params;
    const {
      name,
      email,
      address,
      phone,
      idNat,
      rccm,
      numImpot,
      managerId,
    } = req.body;

    const clientCompany = await prisma.clientCompany.findUnique({
      where: { id: clientCompanyId },
    });

    if (
      !clientCompany ||
      clientCompany.companyId !== req.user.companyId
    ) {
      return res.status(404).json({
        message: "Client company not found",
      });
    }

    const updated = await prisma.clientCompany.update({
      where: { id: clientCompanyId },
      data: {
        name,
        email,
        address,
        phone,
        idNat,
        rccm,
        numImpot,
        managerId,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "UPDATE_CLIENT_COMPANY",
      entity: "ClientCompany",
      entityId: updated.id,
    });

    res.json(updated);
  } catch (error) {
    console.error("Update ClientCompany error:", error);
    res.status(500).json({
      message: "Unable to update client company",
    });
  }
};

/* ======================================================
   DELETE CLIENT COMPANY
====================================================== */
export const deleteClientCompany = async (req, res) => {
  try {
    const { clientCompanyId } = req.params;

    const clientCompany = await prisma.clientCompany.findUnique({
      where: { id: clientCompanyId },
    });

    if (
      !clientCompany ||
      clientCompany.companyId !== req.user.companyId
    ) {
      return res.status(404).json({
        message: "Client company not found",
      });
    }

    await prisma.clientCompany.delete({
      where: { id: clientCompanyId },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "DELETE_CLIENT_COMPANY",
      entity: "ClientCompany",
      entityId: clientCompanyId,
    });

    res.json({ message: "Client company deleted" });
  } catch (error) {
    console.error("Delete ClientCompany error:", error);
    res.status(500).json({
      message: "Unable to delete client company",
    });
  }
};
