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
      return res.status(400).json({
        message: "File is required",
      });
    }

    const ext = req.file.originalname.split(".").pop();
    let rows = [];

    if (ext === "csv") {
      rows = await parseCSV(req.file.buffer);
    } else if (ext === "xlsx") {
      rows = parseExcel(req.file.buffer);
    } else {
      return res.status(400).json({
        message: "Unsupported file format",
      });
    }

    const created = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (!row.name || !row.address) {
        errors.push({
          line: i + 2,
          error: "name and address are required",
        });
        continue;
      }

      try {
        const company = await prisma.clientCompany.create({
          data: {
            name: row.name,
            email: row.email || null,
            phone: row.phone || null,
            address: row.address,
            idNat: row.idNat || null,
            rccm: row.rccm || null,
            numImpot: row.numImpot || null,
            companyId: req.user.companyId,
          },
        });

        // auto schedule
        await prisma.clientCompanySchedule.create({
          data: {
            clientCompanyId: company.id,
          },
        });

        created.push(company.id);
      } catch (err) {
        errors.push({
          line: i + 2,
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
      message: "Import completed",
      created: created.length,
      errors,
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({
      message: "Import failed",
    });
  }
};
