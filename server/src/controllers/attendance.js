import prisma from "../config/db.js";
import { createAuditLog } from "../services/audit.js";


/* ======================================================
   UTILS
====================================================== */

const WEEK_DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const getWeekDay = (date) => WEEK_DAYS[new Date(date).getDay()];

const diffHours = (start, end) =>
  Math.round(((end - start) / (1000 * 60 * 60)) * 100) / 100;

/* ======================================================
   CLOCK IN
====================================================== */
export const clockIn = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const open = await prisma.attendance.findFirst({
      where: { employeeId, endTime: null },
    });

    if (open) {
      return res.status(400).json({
        message: "Employee already clocked in",
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        clientCompany: {
          include: { hrSettings: true },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const settings = employee.clientCompany.hrSettings;
    const now = new Date();

    let attendanceStatus = "PRESENT";
    let lateStatus = "ON_TIME";

    // Retard & absence
    const scheduledStart = new Date(now);
    scheduledStart.setHours(8, 0, 0, 0); //  pourra venir du schedule plus tard

    const lateMinutes = (now - scheduledStart) / (1000 * 60);

    if (lateMinutes > settings.absenceAfterMinutes) {
      attendanceStatus = "ABSENT";
    } else if (lateMinutes > settings.lateToleranceMinutes) {
      lateStatus = "LATE";
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        startTime: now,
        startedDay: getWeekDay(now),
        attendanceStatus,
        lateStatus,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CLOCK_IN",
      entity: "Attendance",
      entityId: attendance.id,
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error("Clock-in error:", error);
    res.status(500).json({ message: "Unable to clock in" });
  }
};

/* ======================================================
   CLOCK OUT
====================================================== */
export const clockOut = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        employee: {
          include: {
            clientCompany: {
              include: { hrSettings: true },
            },
          },
        },
      },
    });

    if (!attendance || attendance.endTime) {
      return res.status(404).json({ message: "Open attendance not found" });
    }

    const now = new Date();
    const settings = attendance.employee.clientCompany.hrSettings;

    const totalHours = diffHours(attendance.startTime, now);
    const normalHours = Math.min(8, totalHours);
    const overtimeHours = Math.max(0, totalHours - 8);

    const overtimeRate =
      attendance.startedDay === "SUNDAY"
        ? settings.overtimeHolidayRate
        : settings.overtimeDayRate;

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        endTime: now,
        endedDay: getWeekDay(now),
        workedHours: totalHours,
        normalHours,
        overtimeHours,
        overtimeRate,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CLOCK_OUT",
      entity: "Attendance",
      entityId: updated.id,
    });

    res.json(updated);
  } catch (error) {
    console.error("Clock-out error:", error);
    res.status(500).json({ message: "Unable to clock out" });
  }
};

/* ======================================================
   LIST ATTENDANCE BY EMPLOYEE
====================================================== */
export const listAttendanceByEmployee = async (req, res) => {
  const { employeeId } = req.params;

  const attendance = await prisma.attendance.findMany({
    where: { employeeId },
    orderBy: { startTime: "desc" },
  });

  res.json(attendance);
};

/* ======================================================
   UPDATE ATTENDANCE (CORRECTION MANUELLE)
====================================================== */
export const updateAttendance = async (req, res) => {
  const { attendanceId } = req.params;
  const { startTime, endTime, attendanceStatus, lateStatus } = req.body;

  let workedHours, normalHours, overtimeHours;

  if (startTime && endTime) {
    workedHours = diffHours(
      new Date(startTime),
      new Date(endTime)
    );
    normalHours = Math.min(8, workedHours);
    overtimeHours = Math.max(0, workedHours - 8);
  }

  const updated = await prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      startTime,
      endTime,
      startedDay: startTime ? getWeekDay(startTime) : undefined,
      endedDay: endTime ? getWeekDay(endTime) : undefined,
      workedHours,
      normalHours,
      overtimeHours,
      attendanceStatus,
      lateStatus,
    },
  });

  res.json(updated);
};

/* ======================================================
   DELETE ATTENDANCE
====================================================== */
export const deleteAttendance = async (req, res) => {
  const { attendanceId } = req.params;

  await prisma.attendance.delete({
    where: { id: attendanceId },
  });

  res.json({ message: "Attendance deleted" });
};



/* ======================================================
   LIST ATTENDANCES (DASHBOARD / RH)
   - Présence
   - Absence
   - Retard
   - Départ tôt
   - Clock in / out
====================================================== */
export const listAttendances = async (req, res) => {
  try {
    const {
      month,
      year,
      clientCompanyId,
    } = req.query;

    const now = new Date();
    const currentMonth =
      month !== undefined ? Number(month) : now.getMonth();
    const currentYear =
      year !== undefined ? Number(year) : now.getFullYear();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const attendances = await prisma.attendance.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        employee: clientCompanyId
          ? { clientCompanyId }
          : undefined,
      },
      include: {
        employee: {
          include: {
            clientCompany: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    const mapped = attendances.map((a) => ({
      id: a.id,
      employee: {
        id: a.employee.id,
        firstname: a.employee.firstname,
        lastname: a.employee.lastname,
        status: a.employee.status,
      },
      clientCompany: a.employee.clientCompany,
      startTime: a.startTime,
      endTime: a.endTime,
      attendanceStatus: a.attendanceStatus,
      lateStatus: a.lateStatus,

      // 🧠 DÉRIVÉS (dashboard)
      isLate: a.lateStatus === "LATE",
      isAbsent: a.attendanceStatus === "ABSENT",
      isPresent: a.attendanceStatus === "PRESENT",
      isEarlyLeave:
        a.workedHours !== null && a.workedHours < 8,
      isCompleted: !!a.startTime && !!a.endTime,

      workedHours: a.workedHours,
    }));

    res.json({
      month: currentMonth + 1,
      year: currentYear,
      total: mapped.length,
      data: mapped,
    });
  } catch (error) {
    console.error("List attendances error:", error);
    res.status(500).json({
      message: "Unable to fetch attendances",
    });
  }
};


/* ======================================================
   CREATE ATTENDANCE (MANUEL / FORMULAIRE)
====================================================== */
export const createAttendanceManual = async (req, res) => {
  try {
    const {
      employeeId,
      checkIn,
      checkOut,
      periodStart,
      periodEnd,
    } = req.body;

    if (!employeeId || !checkIn) {
      return res.status(400).json({
        message: "employeeId et checkIn sont requis",
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        clientCompany: {
          include: { hrSettings: true },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employé introuvable",
      });
    }

    const startTime = new Date(checkIn);
    const endTime = checkOut ? new Date(checkOut) : null;

    let workedHours = null;
    let normalHours = null;
    let overtimeHours = null;

    if (endTime) {
      workedHours = diffHours(startTime, endTime);
      normalHours = Math.min(8, workedHours);
      overtimeHours = Math.max(0, workedHours - 8);
    }

    // 🧠 Statuts
    let attendanceStatus = "PRESENT";
    let lateStatus = "ON_TIME";

    const settings = employee.clientCompany.hrSettings;

    if (settings) {
      const scheduledStart = new Date(startTime);
      scheduledStart.setHours(8, 0, 0, 0);

      const lateMinutes =
        (startTime - scheduledStart) / (1000 * 60);

      if (lateMinutes > settings.absenceAfterMinutes) {
        attendanceStatus = "ABSENT";
      } else if (
        lateMinutes > settings.lateToleranceMinutes
      ) {
        lateStatus = "LATE";
      }
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        startTime,
        endTime,
        startedDay: getWeekDay(startTime),
        endedDay: endTime ? getWeekDay(endTime) : null,
        workedHours,
        normalHours,
        overtimeHours,
        attendanceStatus,
        lateStatus,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_ATTENDANCE",
      entity: "Attendance",
      entityId: attendance.id,
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error("Create attendance manual error:", error);
    res.status(500).json({
      message: "Impossible de créer le pointage",
    });
  }
};


/* ======================================================
   LIST ATTENDANCES (TABLE RH)
   - Table + Tabs + Actions
====================================================== */
export const listAttendancesTable = async (req, res) => {
  try {
    const {
      clientCompanyId,
      employeeId,
      month,
      year,
      periodId,
      status, // PRESENT | ABSENT | LATE | etc.
    } = req.query;

    const now = new Date();
    const hasMonth = month !== undefined && String(month).length > 0;
    const hasYear = year !== undefined && String(year).length > 0;

    let startDate;
    let endDate;

    if (periodId) {
      const period = await prisma.payrollPeriod.findUnique({
        where: { id: periodId },
        select: { startDate: true, endDate: true },
      });

      if (!period) {
        return res.status(404).json({
          message: "Periode payroll introuvable",
        });
      }

      startDate = period.startDate;
      endDate = period.endDate;
    } else {
      const selectedYear = hasYear
        ? Number(year)
        : now.getFullYear();
      const selectedMonth = hasMonth
        ? Number(month) - 1
        : now.getMonth();

      if (hasMonth && !Number.isNaN(selectedMonth)) {
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(
          selectedYear,
          selectedMonth + 1,
          0,
          23,
          59,
          59
        );
      } else if (hasYear && !Number.isNaN(selectedYear)) {
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
      }
    }

    const normalizedStatus = status ? String(status).toUpperCase() : "";

    const where = {
      employee: {
        ...(employeeId && { id: employeeId }),
        ...(clientCompanyId && { clientCompanyId }),
      },
    };

    if (startDate && endDate) {
      where.startTime = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (normalizedStatus === "LATE") {
      where.lateStatus = "LATE";
    } else if (normalizedStatus) {
      where.attendanceStatus = normalizedStatus;
      if (normalizedStatus === "PRESENT") {
        where.lateStatus = "ON_TIME";
      }
    }

    const attendances = await prisma.attendance.findMany({
      where,

      include: {
        employee: {
          include: {
            clientCompany: true,
          },
        },
      },

      orderBy: {
        startTime: "desc",
      },
    });

    const rows = attendances.map((a) => ({
      id: a.id,

      date: a.startTime.toISOString().slice(0, 10),

      checkIn: a.startTime,
      checkOut: a.endTime,

      employee: {
        id: a.employee.id,
        name: `${a.employee.firstname} ${a.employee.lastname}`,
        position: a.employee.position,
        avatar: a.employee.avatar || null,
      },

      clientCompany: {
        id: a.employee.clientCompany.id,
        companyName: a.employee.clientCompany.companyName,
      },

      attendanceStatus: a.attendanceStatus,
      lateStatus: a.lateStatus,

      workedHours: a.workedHours,
      normalHours: a.normalHours,
      overtimeHours: a.overtimeHours,
      overtimeRate: a.overtimeRate,

      // 🧠 Flags UI (Tabs / Badges)
      isPresent: a.attendanceStatus === "PRESENT",
      isAbsent: a.attendanceStatus === "ABSENT",
      isLate: a.lateStatus === "LATE",
      isEarlyLeave:
        a.workedHours !== null && a.workedHours < 8,

      // 🧭 Actions UI
      canView: true,
      canEdit: true,
      canDelete: true,
    }));

    res.json({
      month: hasMonth ? Number(month) : undefined,
      year: hasYear ? Number(year) : undefined,
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Attendance table error:", error);
    res.status(500).json({
      message: "Impossible de charger le tableau de pointage",
    });
  }
};

/* ======================================================
   RECALCULER HEURES + HEURES SUP
====================================================== */
export const recalculateAttendanceOvertime = async (req, res) => {
  try {
    const { month, year, clientCompanyId, periodId } =
      req.body || {};

    let startDate;
    let endDate;

    if (periodId) {
      const period = await prisma.payrollPeriod.findUnique({
        where: { id: periodId },
        select: { startDate: true, endDate: true },
      });

      if (!period) {
        return res.status(404).json({
          message: "Periode payroll introuvable",
        });
      }

      startDate = period.startDate;
      endDate = period.endDate;
    } else {
      if (!month || !year) {
        return res.status(400).json({
          message: "month et year sont requis",
        });
      }

      const selectedMonth = Number(month) - 1;
      const selectedYear = Number(year);

      if (
        Number.isNaN(selectedMonth) ||
        Number.isNaN(selectedYear)
      ) {
        return res.status(400).json({
          message: "month et year invalides",
        });
      }

      startDate = new Date(selectedYear, selectedMonth, 1);
      endDate = new Date(
        selectedYear,
        selectedMonth + 1,
        0,
        23,
        59,
        59
      );
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        endTime: {
          not: null,
        },
        employee: clientCompanyId
          ? { clientCompanyId }
          : undefined,
      },
      include: {
        employee: {
          include: {
            clientCompany: {
              include: { hrSettings: true },
            },
          },
        },
      },
    });

    const updates = attendances.map((attendance) => {
      const totalHours = diffHours(
        attendance.startTime,
        attendance.endTime
      );
      const normalHours = Math.min(8, totalHours);
      const overtimeHours = Math.max(0, totalHours - 8);

      const settings =
        attendance.employee?.clientCompany?.hrSettings;
      const overtimeRate =
        attendance.startedDay === "SUNDAY"
          ? settings?.overtimeHolidayRate ?? 2.0
          : settings?.overtimeDayRate ?? 1.3;

      return prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          workedHours: totalHours,
          normalHours,
          overtimeHours,
          overtimeRate,
        },
      });
    });

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    res.json({
      message: "Recalcul termine",
      updated: updates.length,
    });
  } catch (error) {
    console.error("Recalculate attendance error:", error);
    res.status(500).json({
      message: "Impossible de recalculer les pointages",
    });
  }
};

/* ======================================================
   GET ATTENDANCE BY ID
====================================================== */
export const getAttendanceById = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        employee: {
          include: {
            clientCompany: true,
          },
        },
      },
    });

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    const clientCompany = attendance.employee?.clientCompany;
    if (!clientCompany || clientCompany.companyId !== req.user.companyId) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    if (
      req.user.role === "MANAGER" &&
      clientCompany.managerId !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      id: attendance.id,
      date: attendance.startTime,
      checkIn: attendance.startTime,
      checkOut: attendance.endTime,
      attendanceStatus: attendance.attendanceStatus,
      lateStatus: attendance.lateStatus,
      workedHours: attendance.workedHours,
      employee: {
        id: attendance.employee.id,
        firstname: attendance.employee.firstname,
        lastname: attendance.employee.lastname,
        position: attendance.employee.position,
        status: attendance.employee.status,
        avatar: attendance.employee.avatar || null,
      },
      clientCompany: {
        id: clientCompany.id,
        companyName: clientCompany.companyName,
      },
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({
      message: "Unable to fetch attendance",
    });
  }
};
