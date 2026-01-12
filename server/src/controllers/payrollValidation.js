import prisma from "../config/db.js";

/* ======================================================
   GET PAYROLL (STATUS)
====================================================== */
export const getPayrollValidation = async (req, res) => {
  const { payrollId } = req.params;

  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
    select: {
      id: true,
      validationStatus: true,
      validatedAt: true,
      closedAt: true,
    },
  });

  if (!payroll) {
    return res.status(404).json({ message: "Payroll not found" });
  }

  res.json(payroll);
};

/* ======================================================
   VALIDATE PAYROLL
====================================================== */
export const validatePayroll = async (req, res) => {
  const { payrollId } = req.params;

  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
  });

  if (!payroll) {
    return res.status(404).json({ message: "Payroll not found" });
  }

  if (payroll.validationStatus !== "DRAFT") {
    return res.status(400).json({
      message: "Only DRAFT payroll can be validated",
    });
  }

  const updated = await prisma.payroll.update({
    where: { id: payrollId },
    data: {
      validationStatus: "VALIDATED",
      validatedAt: new Date(),
      validatedById: req.user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: "PAYROLL_VALIDATED",
      entity: "Payroll",
      entityId: payrollId,
    },
  });

  res.json({
    message: "Payroll validated successfully",
    payroll: updated,
  });
};

/* ======================================================
   CLOSE PAYROLL (FINAL LOCK)
====================================================== */
export const closePayroll = async (req, res) => {
  const { payrollId } = req.params;

  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
  });

  if (!payroll) {
    return res.status(404).json({ message: "Payroll not found" });
  }

  if (payroll.validationStatus !== "VALIDATED") {
    return res.status(400).json({
      message: "Payroll must be VALIDATED before closing",
    });
  }

  const updated = await prisma.payroll.update({
    where: { id: payrollId },
    data: {
      validationStatus: "CLOSED",
      closedAt: new Date(),
      closedById: req.user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: "PAYROLL_CLOSED",
      entity: "Payroll",
      entityId: payrollId,
    },
  });

  res.json({
    message: "Payroll closed and locked",
    payroll: updated,
  });
};

/* ======================================================
   REOPEN PAYROLL (OPTIONNEL – SUPER ADMIN ONLY)
====================================================== */
export const reopenPayroll = async (req, res) => {
  const { payrollId } = req.params;

  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
  });

  if (!payroll) {
    return res.status(404).json({ message: "Payroll not found" });
  }

  const updated = await prisma.payroll.update({
    where: { id: payrollId },
    data: {
      validationStatus: "DRAFT",
      validatedAt: null,
      validatedById: null,
      closedAt: null,
      closedById: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: "PAYROLL_REOPENED",
      entity: "Payroll",
      entityId: payrollId,
    },
  });

  res.json({
    message: "Payroll reopened (DRAFT)",
    payroll: updated,
  });
};
