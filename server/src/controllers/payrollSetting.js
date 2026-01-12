import prisma from "../config/db.js";

/* ======================================================
   GET PAYROLL SETTING BY CLIENT COMPANY
====================================================== */
export const getPayrollSetting = async (req, res) => {
  try {
    const { clientCompanyId } = req.params;

    const setting = await prisma.payrollSetting.findUnique({
      where: { clientCompanyId },
    });

    if (!setting) {
      return res.status(404).json({
        message: "PayrollSetting not found for this ClientCompany",
      });
    }

    res.json(setting);
  } catch (error) {
    console.error("Get PayrollSetting error:", error);
    res.status(500).json({
      message: "Unable to fetch PayrollSetting",
    });
  }
};

/* ======================================================
   CREATE PAYROLL SETTING
====================================================== */
export const createPayrollSetting = async (req, res) => {
  try {
    const { clientCompanyId, ...data } = req.body;

    if (!clientCompanyId) {
      return res.status(400).json({
        message: "clientCompanyId is required",
      });
    }

    const existing = await prisma.payrollSetting.findUnique({
      where: { clientCompanyId },
    });

    if (existing) {
      return res.status(409).json({
        message: "PayrollSetting already exists for this ClientCompany",
      });
    }

    const setting = await prisma.payrollSetting.create({
      data: {
        clientCompanyId,
        ...data,
      },
    });

    res.status(201).json(setting);
  } catch (error) {
    console.error("Create PayrollSetting error:", error);
    res.status(500).json({
      message: "Unable to create PayrollSetting",
    });
  }
};

/* ======================================================
   UPDATE PAYROLL SETTING
====================================================== */
export const updatePayrollSetting = async (req, res) => {
  try {
    const { clientCompanyId } = req.params;

    const existing = await prisma.payrollSetting.findUnique({
      where: { clientCompanyId },
    });

    if (!existing) {
      return res.status(404).json({
        message: "PayrollSetting not found",
      });
    }

    const updated = await prisma.payrollSetting.update({
      where: { clientCompanyId },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    console.error("Update PayrollSetting error:", error);
    res.status(500).json({
      message: "Unable to update PayrollSetting",
    });
  }
};

/* ======================================================
   DELETE PAYROLL SETTING
====================================================== */
export const deletePayrollSetting = async (req, res) => {
  try {
    const { clientCompanyId } = req.params;

    const existing = await prisma.payrollSetting.findUnique({
      where: { clientCompanyId },
    });

    if (!existing) {
      return res.status(404).json({
        message: "PayrollSetting not found",
      });
    }

    await prisma.payrollSetting.delete({
      where: { clientCompanyId },
    });

    res.json({
      message: "PayrollSetting deleted successfully",
    });
  } catch (error) {
    console.error("Delete PayrollSetting error:", error);
    res.status(500).json({
      message: "Unable to delete PayrollSetting",
    });
  }
};
