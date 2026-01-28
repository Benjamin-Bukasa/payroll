import prisma from "../config/db.js";
import csv from "csv-parser";
import XLSX from "xlsx";
import { createAuditLog } from "../services/audit.js";
import { Readable } from "stream";

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

export const importClientCompanies = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    if (!req.user?.companyId) {
      return res.status(403).json({ message: "Company context missing" });
    }

    const ext = req.file.originalname.split(".").pop().toLowerCase();
    let rows = [];

    if (ext === "csv") {
      rows = await parseCSV(req.file.buffer);
    } else if (ext === "xlsx" || ext === "xls") {
      rows = parseExcel(req.file.buffer);
    } else {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    const created = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const lineNumber = i + 2; // header + 1

      const companyName = row.companyName?.trim();
      const address = row.address?.trim();

      /* ===============================
         VALIDATION DE BASE
      =============================== */
      if (!companyName || !address) {
        errors.push({
          line: lineNumber,
          error: "companyName et address sont obligatoires",
        });
        continue;
      }

      /* ===============================
         🔒 BLOQUER LES DOUBLONS
      =============================== */
      const exists = await prisma.clientCompany.findFirst({
        where: {
          companyId: req.user.companyId,
          companyName: {
            equals: companyName,
            mode: "insensitive", // 👈 ignore la casse
          },
        },
      });

      if (exists) {
        errors.push({
          line: lineNumber,
          error: `Entreprise "${companyName}" existe déjà`,
        });
        continue;
      }

      /* ===============================
         CRÉATION
      =============================== */
      try {
        const company = await prisma.clientCompany.create({
          data: {
            companyName,
            email: row.email || null,
            phone: row.phone || null,
            address,
            idNat: row.idNat || null,
            rccm: row.rccm || null,
            numImpot: row.numImpot || null,
            activitySector: row.activitySector || "GENERAL",

            company: {
              connect: { id: req.user.companyId },
            },
          },
        });

        // 🔁 Schedule auto
        await prisma.clientCompanySchedule.create({
          data: { clientCompanyId: company.id },
        });

        created.push(company.id);
      } catch (err) {
        errors.push({
          line: lineNumber,
          error: err.message,
        });
      }
    }

    await createAuditLog({
      userId: req.user.id,
      action: "IMPORT_CLIENT_COMPANIES",
      entity: "ClientCompany",
      entityId: req.user.companyId,
      newValue: {
        created: created.length,
        errors: errors.length,
      },
    });

    res.json({
      message: "Import terminé",
      created: created.length,
      ignored: errors.length,
      errors,
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ message: "Import failed" });
  }
};
