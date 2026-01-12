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
