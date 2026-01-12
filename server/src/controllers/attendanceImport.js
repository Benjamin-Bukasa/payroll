import prisma from "../config/db.js";
import csv from "csv-parser";
import XLSX from "xlsx";
import { Readable } from "stream";

/* ===============================
   HELPERS
================================ */

const WEEK_DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const isValidWeekDay = (day) => WEEK_DAYS.includes(day);

const diffHours = (start, end) =>
  Math.round(((end - start) / (1000 * 60 * 60)) * 100) / 100;

const parseCSV = (buffer) =>
  new Promise((resolve, reject) => {
    const results = [];
    Readable.from(buffer)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });

const parseExcel = (buffer) => {
  const workbook = XLSX.read(buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
};

/* ===============================
   IMPORT ATTENDANCE
================================ */

export const importAttendance = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    const ext = req.file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    let rows = [];

    if (ext === "csv") rows = await parseCSV(req.file.buffer);
    else if (ext === "xlsx") rows = parseExcel(req.file.buffer);
    else {
      return res.status(400).json({
        message: "Unsupported file format",
      });
    }

    const created = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (
        !row.firstname ||
        !row.lastname ||
        !row.startedDay ||
        !row.date ||
        !row.startTime ||
        !row.endTime ||
        !row.companyName
      ) {
        errors.push({
          line: i + 2,
          error: "Missing required fields",
        });
        continue;
      }

      if (
        !isValidWeekDay(row.startedDay) ||
        (row.endedDay && !isValidWeekDay(row.endedDay))
      ) {
        errors.push({
          line: i + 2,
          error: "Invalid startedDay or endedDay",
        });
        continue;
      }

      try {
        // 🔎 ClientCompany
        const clientCompany = await prisma.clientCompany.findFirst({
          where: {
            name: row.companyName,
            companyId: req.user.companyId,
          },
          include: { hrSettings: true },
        });

        if (!clientCompany) {
          errors.push({
            line: i + 2,
            error: `ClientCompany "${row.companyName}" not found`,
          });
          continue;
        }

        // 👤 Employee
        const employee = await prisma.employee.findFirst({
          where: {
            firstname: row.firstname,
            lastname: row.lastname,
            clientCompanyId: clientCompany.id,
          },
        });

        if (!employee) {
          errors.push({
            line: i + 2,
            error: `Employee "${row.firstname} ${row.lastname}" not found`,
          });
          continue;
        }

        // ⏱️ Construction dates
        const startTime = new Date(
          `${row.date}T${row.startTime}:00`
        );

        let endTime = new Date(
          `${row.date}T${row.endTime}:00`
        );

        if (row.endedDay && row.endedDay !== row.startedDay) {
          endTime.setDate(endTime.getDate() + 1);
        }

        const totalHours = diffHours(startTime, endTime);
        const normalHours = Math.min(8, totalHours);
        const overtimeHours = Math.max(0, totalHours - 8);

        const overtimeRate =
          row.startedDay === "SUNDAY"
            ? clientCompany.hrSettings.overtimeHolidayRate
            : clientCompany.hrSettings.overtimeDayRate;

        await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            startTime,
            endTime,
            startedDay: row.startedDay,
            endedDay: row.endedDay || row.startedDay,
            workedHours: totalHours,
            normalHours,
            overtimeHours,
            overtimeRate,
            attendanceStatus: "PRESENT",
            lateStatus: "ON_TIME",
          },
        });

        created.push(i + 2);
      } catch (err) {
        errors.push({
          line: i + 2,
          error: err.message,
        });
      }
    }

    res.json({
      message: "Attendance import completed",
      created: created.length,
      errors,
    });
  } catch (error) {
    console.error("Attendance import error:", error);
    res.status(500).json({
      message: "Attendance import failed",
    });
  }
};
