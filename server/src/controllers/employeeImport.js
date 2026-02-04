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
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json(sheet, {
    defval: "", // ✅ évite undefined
    raw: false, // ✅ dates en string lisible
  });
};

/* =======================
   IMPORT EMPLOYEES
======================= */
export const importEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const ext = req.file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    let rows = [];

    if (ext === "csv") {
      rows = await parseCSV(req.file.buffer);
    } else if (ext === "xlsx") {
      rows = parseExcel(req.file.buffer);
    } else {
      return res
        .status(400)
        .json({ message: "Unsupported file format" });
    }

    // ✅ Récupérer le SMIG actif
    const activeSmig = await prisma.smig.findFirst({
      where: { isActive: true },
    });

    if (!activeSmig) {
      return res.status(400).json({
        message:
          "Aucun SMIG actif trouvé. Veuillez en créer un.",
      });
    }

    const created = [];
    const skipped = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (!row.firstname || !row.lastname || !row.companyName) {
        errors.push({
          line: i + 2,
          error:
            "firstname, lastname et companyName requis",
        });
        continue;
      }

      // 🔍 Trouver entreprise cliente par nom
      const clientCompany =
        await prisma.clientCompany.findFirst({
          where: {
            companyName: row.companyName,
            companyId: req.user.companyId,
          },
        });

      if (!clientCompany) {
        errors.push({
          line: i + 2,
          error: `Entreprise cliente introuvable : ${row.companyName}`,
        });
        continue;
      }

      try {
        const exists = await prisma.employee.findFirst({
          where: {
            firstname: row.firstname,
            lastname: row.lastname,
            clientCompanyId: clientCompany.id,
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
            gender: row.gender || "UNKNOWN",
            placeofbirth: row.placeofbirth || "",
            dateOfBirth: row.dateOfBirth
              ? new Date(row.dateOfBirth)
              : new Date("1990-01-01"),
            civilStatus:
              row.civilStatus || "CELIBATAIRE",
            children: Number(row.children || 0),
            adress: row.adress || null,
            phone: row.phone || null,
            email: row.email || null,
            position: row.position || "",
            department: row.department || "",
            status: "ACTIF",
            baseSalary: Number(row.baseSalary || 0),

            // ✅ SMIG PAR DÉFAUT
            smigId: activeSmig.id,

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
    res.status(500).json({
      message: "Import failed",
    });
  }
};
