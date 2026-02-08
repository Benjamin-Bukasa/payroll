import prisma from "../config/db.js";

/* ======================================================
   LIST PAYROLL PERIODS
====================================================== */
export const listPayrollPeriods = async (req, res) => {
  try {
    const { clientCompanyId, openOnly } = req.query;
    const where = {};
    if (openOnly === "true") {
      where.isClosed = false;
    }
    if (clientCompanyId) {
      where.OR = [
        { clientCompanyId },
        { clientCompanyId: null },
      ];
    }

    const periods = await prisma.payrollPeriod.findMany({
      where,
      select: {
        id: true,
        label: true,
        startDate: true,
        endDate: true,
        isClosed: true,
        clientCompanyId: true,
        createdAt: true,
      },
      orderBy: { startDate: "desc" },
    });

    res.json(periods);
  } catch (error) {
    console.error("List payroll periods error:", error);
    res.status(500).json({
      message: "Unable to fetch payroll periods",
    });
  }
};

/* ======================================================
   CREATE PAYROLL PERIOD
====================================================== */
export const createPayrollPeriod = async (req, res) => {
  try {
    const {
      label,
      startDate,
      endDate,
      clientCompanyId,
      applyAll,
    } = req.body;

    const isApplyAll = applyAll === true || applyAll === "true";
    const targetCompanyId = isApplyAll
      ? null
      : clientCompanyId;

    if (!isApplyAll && !clientCompanyId) {
      return res.status(400).json({
        message: "Client company is required",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start and end dates are required",
      });
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    if (
      Number.isNaN(parsedStart.getTime()) ||
      Number.isNaN(parsedEnd.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    if (parsedStart > parsedEnd) {
      return res.status(400).json({
        message: "Start date must be before end date",
      });
    }

    if (!isApplyAll) {
      const company = await prisma.clientCompany.findUnique({
        where: { id: clientCompanyId },
        select: { id: true },
      });

      if (!company) {
        return res.status(404).json({
          message: "Company not found",
        });
      }
    }

    const overlapWhere = {
      startDate: { lte: parsedEnd },
      endDate: { gte: parsedStart },
    };

    if (isApplyAll) {
      // global period must not overlap any other period
    } else {
      overlapWhere.OR = [
        { clientCompanyId },
        { clientCompanyId: null },
      ];
    }

    const overlap = await prisma.payrollPeriod.findFirst({
      where: overlapWhere,
    });

    if (overlap) {
      return res.status(400).json({
        message: "Overlapping payroll period already exists",
      });
    }

    const fallbackLabel = `Periode ${parsedStart
      .toISOString()
      .slice(0, 10)} - ${parsedEnd
      .toISOString()
      .slice(0, 10)}`;

    const created = await prisma.payrollPeriod.create({
      data: {
        label: label?.trim() || fallbackLabel,
        startDate: parsedStart,
        endDate: parsedEnd,
        clientCompanyId: targetCompanyId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "PAYROLL_PERIOD_CREATED",
        entity: "PayrollPeriod",
        entityId: created.id,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error("Create payroll period error:", error);
    res.status(500).json({
      message: "Unable to create payroll period",
    });
  }
};

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
