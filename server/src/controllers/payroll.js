import prisma from "../config/db.js";
import { calculatePayroll } from "../services/payrollCalculator.js";
import { generatePayrollPDF } from "../services/payrollPdf.js";

const DEFAULT_CHART_POINTS = 8;
const WEEK_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const toDateKey = (date) => {
  return date.toISOString().slice(0, 10);
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const buildLastDays = (endDate, count) => {
  const total = Math.max(count, 1);
  const start = addDays(endDate, -(total - 1));
  return Array.from({ length: total }, (_, index) =>
    addDays(start, index)
  );
};

const mapPayrollStatus = (payroll) => {
  if (payroll.paymentStatus === "CANCELLED") {
    return "Suspendu";
  }
  if (payroll.paymentStatus === "PAID") {
    return "Complété";
  }
  if (
    payroll.validationStatus === "VALIDATED" ||
    payroll.validationStatus === "CLOSED"
  ) {
    return "En cours";
  }
  return "En attente";
};

/* ======================================================
   GENERATE MONTHLY PAYROLL + PDF
====================================================== */
export const generateMonthlyPayroll = async (req, res) => {
  try {
    const {
      clientCompanyId,
      month,
      year,
      logoType = "CLIENT", // CLIENT | HOST
    } = req.body;

    const clientCompany =
      await prisma.clientCompany.findUnique({
        where: { id: clientCompanyId },
        include: {
          company: true, // company hôte
          employees: {
            include: { smig: true },
          },
          payrollSettings: true,
        },
      });

    if (!clientCompany) {
      return res.status(404).json({
        message: "ClientCompany not found",
      });
    }

    const payrollSetting =
      clientCompany.payrollSettings[0];

    if (!payrollSetting) {
      return res.status(400).json({
        message: "PayrollSetting not configured",
      });
    }

    const employeeCount =
      clientCompany.employees.length;

    const results = [];

    for (const employee of clientCompany.employees) {
      // ⏱️ Jours prestés
      const daysWorked =
        await prisma.attendance.count({
          where: {
            employeeId: employee.id,
            attendanceStatus: "PRESENT",
            startTime: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
        });

      // 🧮 Calcul paie
      const payrollData =
        calculatePayroll({
          employee,
          smig: employee.smig,
          payrollSetting,
          daysWorked,
          employeeCount,
        });

      // 💾 Enregistrer paie
      const payroll =
        await prisma.payroll.create({
          data: {
            employeeId: employee.id,
            clientCompanyId,
            periodMonth: month,
            periodYear: year,
            daysWorked,
            ...payrollData,
          },
        });

      // 📄 Générer PDF
      const pdfPath = generatePayrollPDF({
        payroll,
        employee,
        clientCompany,
        company: clientCompany.company,
        logoType,
      });

      // (OPTIONNEL) sauvegarder le chemin PDF
      await prisma.payroll.update({
        where: { id: payroll.id },
        data: {
          pdfPath,
        },
      });

      results.push({
        employee: `${employee.firstname} ${employee.lastname}`,
        payrollId: payroll.id,
        pdf: pdfPath,
      });
    }

    res.json({
      message: "Monthly payroll generated successfully",
      month,
      year,
      totalEmployees: results.length,
      payrolls: results,
    });
  } catch (error) {
    console.error("Generate payroll error:", error);
    res.status(500).json({
      message: "Payroll generation failed",
    });
  }
};

/* ======================================================
   DASHBOARD DATA
====================================================== */
export const getPayrollDashboard = async (req, res) => {
  try {
    const { role, companyId, id: userId } = req.user;
    const {
      periodId,
      clientCompanyId,
      month,
      year,
    } = req.query;

    if (role === "USER") {
      return res.json({
        period: null,
        currency: "USD",
        totalEmployees: 0,
        totalAmount: 0,
        paymentStatus: [],
        cashFlowDays: [],
        revenuePoints: [],
        expensePoints: [],
        salaryTracker: [],
        payrollRows: [],
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { devise: true },
    });

    const companyFilter = {
      companyId,
    };

    if (role === "MANAGER") {
      companyFilter.managerId = userId;
    }

    const clientCompanies = await prisma.clientCompany.findMany({
      where: companyFilter,
      select: { id: true },
    });

    let allowedCompanyIds = clientCompanies.map((c) => c.id);

    if (clientCompanyId) {
      if (!allowedCompanyIds.includes(clientCompanyId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      allowedCompanyIds = [clientCompanyId];
    }

    if (allowedCompanyIds.length === 0) {
      return res.json({
        period: null,
        currency: company?.devise || "USD",
        totalEmployees: 0,
        totalAmount: 0,
        paymentStatus: [],
        cashFlowDays: [],
        revenuePoints: [],
        expensePoints: [],
        salaryTracker: [],
        payrollRows: [],
      });
    }

    const now = new Date();
    const parsedMonth =
      month !== undefined ? Number(month) : null;
    const parsedYear = year !== undefined ? Number(year) : null;
    const hasCustomRange =
      Number.isInteger(parsedMonth) &&
      Number.isInteger(parsedYear);

    if (
      hasCustomRange &&
      (parsedMonth < 1 || parsedMonth > 12)
    ) {
      return res.status(400).json({
        message: "Invalid month value",
      });
    }

    const targetYear = hasCustomRange
      ? parsedYear
      : now.getFullYear();
    const targetMonthIndex = hasCustomRange
      ? parsedMonth - 1
      : now.getMonth();
    const startOfMonth = new Date(
      targetYear,
      targetMonthIndex,
      1
    );
    const endOfMonth = new Date(
      targetYear,
      targetMonthIndex + 1,
      0
    );

    let period = null;

    if (periodId) {
      period = await prisma.payrollPeriod.findUnique({
        where: { id: periodId },
      });

      if (!period) {
        return res.status(404).json({ message: "Period not found" });
      }
    } else if (hasCustomRange) {
      period = await prisma.payrollPeriod.findFirst({
        where: {
          startDate: { lte: endOfMonth },
          endDate: { gte: startOfMonth },
        },
        orderBy: { startDate: "desc" },
      });
    } else {
      period = await prisma.payrollPeriod.findFirst({
        where: {
          startDate: { lte: now },
          endDate: { gte: now },
        },
        orderBy: { startDate: "desc" },
      });

      if (!period) {
        period = await prisma.payrollPeriod.findFirst({
          orderBy: { startDate: "desc" },
        });
      }
    }

    const payrollWhere = {
      employee: {
        clientCompanyId: { in: allowedCompanyIds },
      },
    };

    if (period?.id) {
      payrollWhere.periodId = period.id;
    } else {
      payrollWhere.createdAt = {
        gte: startOfMonth,
        lt: addDays(endOfMonth, 1),
      };
    }

    const payrolls = await prisma.payroll.findMany({
      where: payrollWhere,
      include: {
        employee: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            department: true,
          },
        },
        period: {
          select: {
            id: true,
            label: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalEmployees = payrolls.length;
    const totalAmount = payrolls.reduce(
      (sum, payroll) => sum + (payroll.netSalary || 0),
      0
    );

    const statusCounts = {
      payes: 0,
      enAttente: 0,
      suspendus: 0,
    };

    payrolls.forEach((payroll) => {
      const status = mapPayrollStatus(payroll);
      if (status === "Complété") {
        statusCounts.payes += 1;
      } else if (status === "Suspendu") {
        statusCounts.suspendus += 1;
      } else {
        statusCounts.enAttente += 1;
      }
    });

    const paymentStatusTotal = totalEmployees || 1;
    const paymentStatus = [
      {
        label: "Payés",
        value: Math.round(
          (statusCounts.payes / paymentStatusTotal) * 100
        ),
        color: "#6366F1",
      },
      {
        label: "En attente",
        value: Math.round(
          (statusCounts.enAttente / paymentStatusTotal) * 100
        ),
        color: "#F59E0B",
      },
      {
        label: "Suspendus",
        value: Math.round(
          (statusCounts.suspendus / paymentStatusTotal) * 100
        ),
        color: "#FB7185",
      },
    ];

    const cashFlowEnd = period?.endDate || endOfMonth || now;
    const cashFlowDays = buildLastDays(
      cashFlowEnd,
      DEFAULT_CHART_POINTS
    );

    const revenueByDay = {};
    const expenseByDay = {};

    payrolls.forEach((payroll) => {
      const date = payroll.paymentDate || payroll.createdAt;
      const key = toDateKey(date);
      revenueByDay[key] =
        (revenueByDay[key] || 0) + payroll.grossSalary;
      const deductions =
        payroll.totalDeductions ??
        Math.max(payroll.grossSalary - payroll.netSalary, 0);
      expenseByDay[key] =
        (expenseByDay[key] || 0) + deductions;
    });

    const cashFlowLabels = cashFlowDays.map((day) =>
      day.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      })
    );

    const revenuePoints = cashFlowDays.map((day) => {
      const value = revenueByDay[toDateKey(day)] || 0;
      return Number(value.toFixed(2));
    });

    const expensePoints = cashFlowDays.map((day) => {
      const value = expenseByDay[toDateKey(day)] || 0;
      return Number(value.toFixed(2));
    });

    const weekTotals = Array(7).fill(0);
    payrolls.forEach((payroll) => {
      const date = payroll.paymentDate || payroll.createdAt;
      const dayIndex = (date.getDay() + 6) % 7;
      weekTotals[dayIndex] += payroll.netSalary || 0;
    });
    const weekMax = Math.max(...weekTotals, 1);
    const salaryTracker = WEEK_LABELS.map((day, index) => ({
      day,
      employee: Math.round((weekTotals[index] / weekMax) * 100),
      freelancer: 0,
    }));

    const payrollRows = payrolls.map((payroll) => ({
      id: payroll.id,
      name: `${payroll.employee.firstname} ${payroll.employee.lastname}`,
      email: payroll.employee.email,
      department: payroll.employee.department,
      periodStart:
        payroll.period?.startDate?.toISOString() ||
        startOfMonth.toISOString(),
      periodEnd:
        payroll.period?.endDate?.toISOString() ||
        endOfMonth.toISOString(),
      salary: payroll.netSalary,
      type: "Mensuel",
      status: mapPayrollStatus(payroll),
    }));

    const periodPayload = period
      ? {
          id: period.id,
          label: period.label,
          startDate: period.startDate,
          endDate: period.endDate,
        }
      : {
          id: null,
          label: `Mois ${targetMonthIndex + 1}/${targetYear}`,
          startDate: startOfMonth,
          endDate: endOfMonth,
        };

    res.json({
      period: periodPayload,
      currency: company?.devise || "USD",
      totalEmployees,
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentStatus,
      cashFlowDays: cashFlowLabels,
      revenuePoints,
      expensePoints,
      salaryTracker,
      payrollRows,
    });
  } catch (error) {
    console.error("Get payroll dashboard error:", error);
    res.status(500).json({
      message: "Unable to fetch payroll dashboard",
    });
  }
};
