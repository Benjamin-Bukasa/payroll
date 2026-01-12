import prisma from "../config/db.js";
import { createAuditLog } from "../services/audit.js";

/**
 * =====================================
 * CREATE SCHEDULE
 * (normalement auto à la création clientCompany,
 * mais exposé si besoin)
 * =====================================
 */
export const createSchedule = async (req, res) => {
  const { clientCompanyId } = req.body;

  // Vérifier existence
  const existing = await prisma.clientCompanySchedule.findUnique({
    where: { clientCompanyId },
  });

  if (existing) {
    return res.status(400).json({
      message: "Schedule already exists for this client company",
    });
  }

  const schedule = await prisma.clientCompanySchedule.create({
    data: { clientCompanyId },
  });

  await createAuditLog({
    userId: req.user.id,
    action: "CREATE_CLIENT_COMPANY_SCHEDULE",
    entity: "ClientCompanySchedule",
    entityId: schedule.id,
  });

  res.status(201).json(schedule);
};

/**
 * =====================================
 * GET ONE SCHEDULE (by clientCompany)
 * =====================================
 */
export const getSchedule = async (req, res) => {
  const { clientCompanyId } = req.params;

  const schedule = await prisma.clientCompanySchedule.findUnique({
    where: { clientCompanyId },
  });

  if (!schedule) {
    return res.status(404).json({
      message: "Schedule not found",
    });
  }

  res.json(schedule);
};

/**
 * =====================================
 * LIST ALL SCHEDULES (company scope)
 * =====================================
 */
export const listSchedules = async (req, res) => {
  const schedules = await prisma.clientCompanySchedule.findMany({
    where: {
      clientCompany: {
        companyId: req.user.companyId,
      },
    },
    include: {
      clientCompany: {
        select: { name: true },
      },
    },
  });

  res.json(schedules);
};

/**
 * =====================================
 * UPDATE SCHEDULE
 * =====================================
 */
export const updateSchedule = async (req, res) => {
  const { clientCompanyId } = req.params;
  const {
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
  } = req.body;

  const schedule = await prisma.clientCompanySchedule.findUnique({
    where: { clientCompanyId },
    include: {
      clientCompany: true,
    },
  });

  if (
    !schedule ||
    schedule.clientCompany.companyId !== req.user.companyId
  ) {
    return res.status(404).json({
      message: "Schedule not found",
    });
  }

  const updated = await prisma.clientCompanySchedule.update({
    where: { clientCompanyId },
    data: {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    },
  });

  await createAuditLog({
    userId: req.user.id,
    action: "UPDATE_CLIENT_COMPANY_SCHEDULE",
    entity: "ClientCompanySchedule",
    entityId: updated.id,
  });

  res.json(updated);
};

/**
 * =====================================
 * DELETE SCHEDULE (rare mais complet)
 * =====================================
 */
export const deleteSchedule = async (req, res) => {
  const { clientCompanyId } = req.params;

  const schedule = await prisma.clientCompanySchedule.findUnique({
    where: { clientCompanyId },
    include: {
      clientCompany: true,
    },
  });

  if (
    !schedule ||
    schedule.clientCompany.companyId !== req.user.companyId
  ) {
    return res.status(404).json({
      message: "Schedule not found",
    });
  }

  await prisma.clientCompanySchedule.delete({
    where: { clientCompanyId },
  });

  await createAuditLog({
    userId: req.user.id,
    action: "DELETE_CLIENT_COMPANY_SCHEDULE",
    entity: "ClientCompanySchedule",
    entityId: schedule.id,
  });

  res.json({ message: "Schedule deleted" });
};
