import prisma from "../config/db.js";
import { createAuditLog } from "../services/audit.js";

/* ======================================================
   CREATE CLIENT COMPANY
====================================================== */
export const createClientCompany = async (req, res) => {
  try {
    const {
      companyName,
      email,
      address,
      idNat,
      rccm,
      numImpot,
      activitySector,
      managerId,
    } = req.body;

    if (!req.user?.companyId) {
      return res.status(403).json({
        message: "Company context missing",
      });
    }

    if (!companyName || !address) {
      return res.status(400).json({
        message: "companyName and address are required",
      });
    }

    //  ANTI-DOUBLON
    const existing = await prisma.clientCompany.findFirst({
      where: {
        companyName: companyName.trim(),
        companyId: req.user.companyId,
      },
    });

    if (existing) {
      return res.status(409).json({
        message: "Une entreprise cliente avec ce nom existe déjà",
      });
    }

    const clientCompany = await prisma.clientCompany.create({
      data: {
        companyName: companyName.trim(),
        email: email || null,
        address,
        idNat: idNat || null,
        rccm: rccm || null,
        numImpot: numImpot || null,
        activitySector: activitySector || "GENERAL",

        company: {
          connect: { id: req.user.companyId },
        },

        ...(managerId && {
          manager: {
            connect: { id: managerId },
          },
        }),
      },
    });

    await prisma.clientCompanySchedule.create({
      data: { clientCompanyId: clientCompany.id },
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
   LIST CLIENT COMPANIES 
====================================================== */
export const listClientCompanies = async (req, res) => {
  try {
    const companies = await prisma.clientCompany.findMany({
      where: {
        companyId: req.user.companyId,
      },
      include: {
        manager: true,
        _count: {
          select: { employees: true },
        },
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
        manager: true,
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
      companyName,
      email,
      address,
      idNat,
      rccm,
      numImpot,
      activitySector,
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
        companyName,
        email,
        address,
        idNat,
        rccm,
        numImpot,
        activitySector,

        //  Manager relation (CORRECT)
        ...(managerId === null
          ? { manager: { disconnect: true } }
          : managerId
          ? { manager: { connect: { id: managerId } } }
          : {}),
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
