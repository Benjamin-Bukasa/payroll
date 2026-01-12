import prisma from "../config/db.js";
import csv from "csv-parser";
import XLSX from "xlsx";
import { Readable } from "stream";
import { createAuditLog } from "../services/audit.js";

/* ======================================================
   HELPERS
====================================================== */

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

/* ======================================================
   IMPORT EMPLOYEES
====================================================== */

export const importEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    const extension = req.file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    let rows = [];

    if (extension === "csv") {
      rows = await parseCSV(req.file.buffer);
    } else if (extension === "xlsx") {
      rows = parseExcel(req.file.buffer);
    } else {
      return res.status(400).json({
        message: "Unsupported file format (csv or xlsx only)",
      });
    }

    const created = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // ======================
      // VALIDATION MINIMALE
      // ======================
      if (
        !row.firstname ||
        !row.lastname ||
        !row.gender ||
        !row.dateOfBirth ||
        !row.civilStatus ||
        row.children === undefined ||
        !row.position ||
        !row.department ||
        !row.baseSalary ||
        !row.companyName
      ) {
        errors.push({
          line: i + 2,
          error: "Missing required fields",
        });
        continue;
      }

      if (Number(row.children) < 0) {
        errors.push({
          line: i + 2,
          error: "children must be >= 0",
        });
        continue;
      }

      try {
        // ======================
        // RESOLUTION CLIENT COMPANY PAR NOM
        // ======================
        const clientCompany = await prisma.clientCompany.findFirst({
          where: {
            name: row.companyName,
            companyId: req.user.companyId,
          },
        });

        if (!clientCompany) {
          errors.push({
            line: i + 2,
            error: `ClientCompany "${row.companyName}" not found`,
          });
          continue;
        }

        // ======================
        // CREATION EMPLOYEE
        // ======================
        const employee = await prisma.employee.create({
          data: {
            firstname: row.firstname,
            lastname: row.lastname,
            gender: row.gender,
            placeofbirth: row.placeofbirth || null,
            dateOfBirth: new Date(row.dateOfBirth),
            civilStatus: row.civilStatus,
            children: Number(row.children),
            adress: row.adress || null,
            phone: row.phone || null,
            email: row.email || null,
            position: row.position,
            department: row.department,
            baseSalary: Number(row.baseSalary),
            clientCompanyId: clientCompany.id,
          },
        });

        created.push(employee.id);
      } catch (err) {
        errors.push({
          line: i + 2,
          error: err.message,
        });
      }
    }

    // ======================
    // AUDIT LOG
    // ======================
    await createAuditLog({
      userId: req.user.id,
      action: "IMPORT_EMPLOYEES",
      entity: "Employee",
      entityId: req.user.companyId,
      newValue: {
        created: created.length,
        errors: errors.length,
      },
    });

    res.json({
      message: "Employee import completed",
      created: created.length,
      errors,
    });
  } catch (error) {
    console.error("Import employees error:", error);
    res.status(500).json({
      message: "Employee import failed",
    });
  }
};
