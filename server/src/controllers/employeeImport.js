import prisma from "../config/db.js";
import csv from "csv-parser";
import XLSX from "xlsx";
import { Readable } from "stream";
import { createAuditLog } from "../services/audit.js";

/* =======================
   PARSERS
======================= */
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

/* =======================
   IMPORT EMPLOYEES
======================= */
export const importEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const ext = req.file.originalname.split(".").pop();
    let rows = [];

    if (ext === "csv") rows = await parseCSV(req.file.buffer);
    else if (ext === "xlsx") rows = parseExcel(req.file.buffer);
    else {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    const created = [];
    const skipped = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (!row.firstname || !row.lastname || !row.clientCompanyId) {
        errors.push({
          line: i + 2,
          error: "firstname, lastname et clientCompanyId requis",
        });
        continue;
      }

      try {
        // 🔍 Vérifier si employé existe déjà
        const exists = await prisma.employee.findFirst({
          where: {
            OR: [
              row.email ? { email: row.email } : undefined,
              {
                firstname: row.firstname,
                lastname: row.lastname,
                clientCompanyId: row.clientCompanyId,
              },
            ].filter(Boolean),
          },
        });

        if (exists) {
          skipped.push({
            line: i + 2,
            reason: "Employé déjà existant",
          });
          continue;
        }

        const employee = await prisma.employee.create({
          data: {
            firstname: row.firstname,
            lastname: row.lastname,
            email: row.email || null,
            phone: row.phone || null,
            gender: row.gender || "UNKNOWN",
            position: row.position || "",
            department: row.department || "",
            status: "ACTIF",
            baseSalary: Number(row.baseSalary || 0),
            smigId: row.smigId,
            clientCompanyId: row.clientCompanyId,
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

    await createAuditLog({
      userId: req.user.id,
      action: "IMPORT_EMPLOYEES",
      entity: "Employee",
      entityId: req.user.companyId,
    });

    res.json({
      message: "Import terminé",
      created: created.length,
      skipped,
      errors,
    });
  } catch (error) {
    console.error("Import employees error:", error);
    res.status(500).json({ message: "Import failed" });
  }
};
