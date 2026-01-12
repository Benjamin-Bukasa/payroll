import prisma from "../config/db.js";
import { calculatePayroll } from "../services/payrollCalculator.js";
import { generatePayrollPDF } from "../services/payrollPdf.js";

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
