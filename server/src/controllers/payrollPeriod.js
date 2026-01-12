import prisma from "../config/db.js";

/* ======================================================
   GET PAYROLL PERIOD
====================================================== */
export const getPayrollPeriod = async (req, res) => {
  const { periodId } = req.params;

  const period = await prisma.payrollPeriod.findUnique({
    where: { id: periodId },
    include: {
      payrolls: {
        select: {
          id: true,
          validationStatus: true,
        },
      },
    },
  });

  if (!period) {
    return res.status(404).json({ message: "Period not found" });
  }

  res.json(period);
};

/* ======================================================
   CLOSE PAYROLL PERIOD
====================================================== */
export const closePayrollPeriod = async (req, res) => {
  const { periodId } = req.params;

  const period = await prisma.payrollPeriod.findUnique({
    where: { id: periodId },
    include: { payrolls: true },
  });

  if (!period) {
    return res.status(404).json({ message: "Period not found" });
  }

  const invalidPayroll = period.payrolls.find(
    (p) => p.validationStatus !== "VALIDATED"
  );

  if (invalidPayroll) {
    return res.status(400).json({
      message: "All payrolls must be VALIDATED before closing period",
    });
  }

  const updated = await prisma.payrollPeriod.update({
    where: { id: periodId },
    data: {
      isClosed: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: "PAYROLL_PERIOD_CLOSED",
      entity: "PayrollPeriod",
      entityId: periodId,
    },
  });

  res.json({
    message: "Payroll period closed successfully",
    period: updated,
  });
};

/* ======================================================
   REOPEN PAYROLL PERIOD (SUPER ADMIN)
====================================================== */
export const reopenPayrollPeriod = async (req, res) => {
  const { periodId } = req.params;

  const updated = await prisma.payrollPeriod.update({
    where: { id: periodId },
    data: {
      isClosed: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: "PAYROLL_PERIOD_REOPENED",
      entity: "PayrollPeriod",
      entityId: periodId,
    },
  });

  res.json({
    message: "Payroll period reopened",
    period: updated,
  });
};
