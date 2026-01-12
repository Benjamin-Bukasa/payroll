import prisma from "../config/db.js";
import { createAuditLog } from "../services/audit.js";

/* ======================================================
   UTILS
====================================================== */

const isValidTime = (time) =>
  /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

/* ======================================================
   CREATE EMPLOYEE SCHEDULE (SHIFT)
====================================================== */
export const createEmployeeSchedule = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      startDay,
      endDay,
      startTime,
      endTime,
    } = req.body;

    if (
      !startDay ||
      !endDay ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return res.status(400).json({
        message: "Invalid time format (HH:mm)",
      });
    }

    if (startDay === endDay && startTime >= endTime) {
      return res.status(400).json({
        message:
          "startTime must be before endTime for same day shift",
      });
    }

    // Charger employee + company + schedule
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        clientCompany: {
          include: { schedule: true },
        },
      },
    });

    if (
      !employee ||
      employee.clientCompany.companyId !== req.user.companyId
    ) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Vérifier jour ouvert
    const companySchedule =
      employee.clientCompany.schedule;

    if (
      !companySchedule ||
      companySchedule[startDay.toLowerCase()] === false
    ) {
      return res.status(400).json({
        message: `Company is closed on ${startDay}`,
      });
    }

    const schedule = await prisma.employeeSchedule.create({
      data: {
        employeeId,
        startDay,
        endDay,
        startTime,
        endTime,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_EMPLOYEE_SCHEDULE",
      entity: "EmployeeSchedule",
      entityId: schedule.id,
    });

    res.status(201).json(schedule);
  } catch (error) {
    console.error("Create EmployeeSchedule error:", error);
    res.status(500).json({
      message: "Unable to create employee schedule",
    });
  }
};

/* ======================================================
   GET ALL SCHEDULES OF ONE EMPLOYEE
====================================================== */
export const getEmployeeSchedules = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { clientCompany: true },
    });

    if (
      !employee ||
      employee.clientCompany.companyId !== req.user.companyId
    ) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const schedules = await prisma.employeeSchedule.findMany({
      where: { employeeId },
      orderBy: { createdAt: "asc" },
    });

    res.json(schedules);
  } catch (error) {
    console.error("Get EmployeeSchedules error:", error);
    res.status(500).json({
      message: "Unable to fetch employee schedules",
    });
  }
};

/* ======================================================
   GET ONE SCHEDULE BY ID
====================================================== */
export const getEmployeeScheduleById = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await prisma.employeeSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        employee: {
          include: { clientCompany: true },
        },
      },
    });

    if (
      !schedule ||
      schedule.employee.clientCompany.companyId !==
        req.user.companyId
    ) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    res.json(schedule);
  } catch (error) {
    console.error("Get EmployeeSchedule error:", error);
    res.status(500).json({
      message: "Unable to fetch schedule",
    });
  }
};

/* ======================================================
   UPDATE EMPLOYEE SCHEDULE
====================================================== */
export const updateEmployeeSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const {
      startDay,
      endDay,
      startTime,
      endTime,
    } = req.body;

    if (
      startDay &&
      endDay &&
      startDay === endDay &&
      startTime &&
      endTime &&
      startTime >= endTime
    ) {
      return res.status(400).json({
        message:
          "startTime must be before endTime for same day shift",
      });
    }

    const schedule = await prisma.employeeSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        employee: {
          include: { clientCompany: true },
        },
      },
    });

    if (
      !schedule ||
      schedule.employee.clientCompany.companyId !==
        req.user.companyId
    ) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    const updated = await prisma.employeeSchedule.update({
      where: { id: scheduleId },
      data: {
        startDay,
        endDay,
        startTime,
        endTime,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "UPDATE_EMPLOYEE_SCHEDULE",
      entity: "EmployeeSchedule",
      entityId: updated.id,
    });

    res.json(updated);
  } catch (error) {
    console.error("Update EmployeeSchedule error:", error);
    res.status(500).json({
      message: "Unable to update schedule",
    });
  }
};

/* ======================================================
   DELETE EMPLOYEE SCHEDULE
====================================================== */
export const deleteEmployeeSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await prisma.employeeSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        employee: {
          include: { clientCompany: true },
        },
      },
    });

    if (
      !schedule ||
      schedule.employee.clientCompany.companyId !==
        req.user.companyId
    ) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    await prisma.employeeSchedule.delete({
      where: { id: scheduleId },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "DELETE_EMPLOYEE_SCHEDULE",
      entity: "EmployeeSchedule",
      entityId: schedule.id,
    });

    res.json({ message: "Schedule deleted" });
  } catch (error) {
    console.error("Delete EmployeeSchedule error:", error);
    res.status(500).json({
      message: "Unable to delete schedule",
    });
  }
};
