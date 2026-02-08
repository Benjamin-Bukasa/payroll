import prisma from "../config/db.js";
import { createAuditLog } from "../services/audit.js";

const toNumber = (value, field) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${field} must be a number`);
  }
  return parsed;
};

const toInt = (value, field) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`${field} must be an integer`);
  }
  return parsed;
};

const toBoolean = (value, field) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true" || value === "1" || value === 1) {
    return true;
  }
  if (value === "false" || value === "0" || value === 0) {
    return false;
  }
  throw new Error(`${field} must be a boolean`);
};

const buildPayrollSettingData = (body) => {
  const data = {};
  const setIfDefined = (key, value) => {
    if (value !== undefined) {
      data[key] = value;
    }
  };

  if ("housingRate" in body) {
    setIfDefined(
      "housingRate",
      toNumber(body.housingRate, "housingRate")
    );
  }
  if ("maxChildrenAllowance" in body) {
    setIfDefined(
      "maxChildrenAllowance",
      toInt(body.maxChildrenAllowance, "maxChildrenAllowance")
    );
  }
  if ("familyAllowanceDivider" in body) {
    setIfDefined(
      "familyAllowanceDivider",
      toInt(body.familyAllowanceDivider, "familyAllowanceDivider")
    );
  }
  if ("taxiFare" in body) {
    setIfDefined("taxiFare", toNumber(body.taxiFare, "taxiFare"));
  }
  if ("taxiCoursesPerDay" in body) {
    setIfDefined(
      "taxiCoursesPerDay",
      toInt(body.taxiCoursesPerDay, "taxiCoursesPerDay")
    );
  }
  if ("medicalAllowance" in body) {
    setIfDefined(
      "medicalAllowance",
      toNumber(body.medicalAllowance, "medicalAllowance")
    );
  }
  if ("cnssQPORate" in body) {
    setIfDefined(
      "cnssQPORate",
      toNumber(body.cnssQPORate, "cnssQPORate")
    );
  }
  if ("iprReductionRate" in body) {
    setIfDefined(
      "iprReductionRate",
      toNumber(body.iprReductionRate, "iprReductionRate")
    );
  }
  if ("iprMaxChildren" in body) {
    setIfDefined(
      "iprMaxChildren",
      toInt(body.iprMaxChildren, "iprMaxChildren")
    );
  }
  if ("defaultUnionFee" in body) {
    setIfDefined(
      "defaultUnionFee",
      toNumber(body.defaultUnionFee, "defaultUnionFee")
    );
  }
  if ("allowSalaryAdvance" in body) {
    setIfDefined(
      "allowSalaryAdvance",
      toBoolean(body.allowSalaryAdvance, "allowSalaryAdvance")
    );
  }
  if ("isMiningSector" in body) {
    setIfDefined(
      "isMiningSector",
      toBoolean(body.isMiningSector, "isMiningSector")
    );
  }
  if ("miningSectorMaxYears" in body) {
    setIfDefined(
      "miningSectorMaxYears",
      toInt(body.miningSectorMaxYears, "miningSectorMaxYears")
    );
  }
  if ("iereRate" in body) {
    setIfDefined("iereRate", toNumber(body.iereRate, "iereRate"));
  }
  if ("iereMiningRate" in body) {
    setIfDefined(
      "iereMiningRate",
      toNumber(body.iereMiningRate, "iereMiningRate")
    );
  }
  if ("cnssRiskEmployerRate" in body) {
    setIfDefined(
      "cnssRiskEmployerRate",
      toNumber(body.cnssRiskEmployerRate, "cnssRiskEmployerRate")
    );
  }
  if ("cnssRetirementRate" in body) {
    setIfDefined(
      "cnssRetirementRate",
      toNumber(body.cnssRetirementRate, "cnssRetirementRate")
    );
  }
  if ("cnssFamilyRate" in body) {
    setIfDefined(
      "cnssFamilyRate",
      toNumber(body.cnssFamilyRate, "cnssFamilyRate")
    );
  }
  if ("onemRate" in body) {
    setIfDefined("onemRate", toNumber(body.onemRate, "onemRate"));
  }
  if ("inppRateSmall" in body) {
    setIfDefined(
      "inppRateSmall",
      toNumber(body.inppRateSmall, "inppRateSmall")
    );
  }
  if ("inppRateMedium" in body) {
    setIfDefined(
      "inppRateMedium",
      toNumber(body.inppRateMedium, "inppRateMedium")
    );
  }
  if ("inppRateLarge" in body) {
    setIfDefined(
      "inppRateLarge",
      toNumber(body.inppRateLarge, "inppRateLarge")
    );
  }

  return data;
};

const ensureClientCompanyAccess = (clientCompany, req, res) => {
  if (!clientCompany) {
    res.status(404).json({
      message: "ClientCompany not found",
    });
    return false;
  }

  if (clientCompany.companyId !== req.user.companyId) {
    res.status(403).json({ message: "Access denied" });
    return false;
  }

  if (
    req.user.role === "MANAGER" &&
    clientCompany.managerId !== req.user.id
  ) {
    res.status(403).json({ message: "Access denied" });
    return false;
  }

  return true;
};

const ensureSettingAccess = (setting, req, res) => {
  if (!setting) {
    res.status(404).json({
      message: "PayrollSetting not found",
    });
    return false;
  }

  if (setting.clientCompany.companyId !== req.user.companyId) {
    res.status(403).json({ message: "Access denied" });
    return false;
  }

  if (
    req.user.role === "MANAGER" &&
    setting.clientCompany.managerId !== req.user.id
  ) {
    res.status(403).json({ message: "Access denied" });
    return false;
  }

  return true;
};

/* ======================================================
   LIST PAYROLL SETTINGS (company scope)
====================================================== */
export const listPayrollSettings = async (req, res) => {
  try {
    const where = {
      clientCompany: {
        companyId: req.user.companyId,
      },
    };

    if (req.user.role === "MANAGER") {
      where.clientCompany.managerId = req.user.id;
    }

    const settings = await prisma.payrollSetting.findMany({
      where,
      include: {
        clientCompany: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(settings);
  } catch (error) {
    console.error("List PayrollSetting error:", error);
    res.status(500).json({
      message: "Unable to fetch PayrollSetting list",
    });
  }
};

/* ======================================================
   GET PAYROLL SETTING BY CLIENT COMPANY
====================================================== */
export const getPayrollSetting = async (req, res) => {
  try {
    const { clientCompanyId } = req.params;

    const setting = await prisma.payrollSetting.findUnique({
      where: { clientCompanyId },
      include: {
        clientCompany: {
          select: {
            companyId: true,
            managerId: true,
          },
        },
      },
    });

    if (!ensureSettingAccess(setting, req, res)) {
      return;
    }

    const { clientCompany, ...payload } = setting;
    res.json(payload);
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

    const clientCompany = await prisma.clientCompany.findUnique({
      where: { id: clientCompanyId },
      select: {
        id: true,
        companyId: true,
        managerId: true,
      },
    });

    if (!ensureClientCompanyAccess(clientCompany, req, res)) {
      return;
    }

    const existing = await prisma.payrollSetting.findUnique({
      where: { clientCompanyId },
    });

    if (existing) {
      return res.status(409).json({
        message: "PayrollSetting already exists for this ClientCompany",
      });
    }

    let payload = {};
    try {
      payload = buildPayrollSettingData(data);
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Invalid payload",
      });
    }

    const setting = await prisma.payrollSetting.create({
      data: {
        clientCompanyId,
        ...payload,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_PAYROLL_SETTING",
      entity: "PayrollSetting",
      entityId: setting.id,
      newValue: payload,
    });

    res.status(201).json(setting);
  } catch (error) {
    console.error("Create PayrollSetting error:", error);
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "PayrollSetting already exists for this ClientCompany",
      });
    }
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
      include: {
        clientCompany: {
          select: {
            companyId: true,
            managerId: true,
          },
        },
      },
    });

    if (!ensureSettingAccess(existing, req, res)) {
      return;
    }

    let payload = {};
    try {
      payload = buildPayrollSettingData(req.body);
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Invalid payload",
      });
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        message: "No valid fields to update",
      });
    }

    const updated = await prisma.payrollSetting.update({
      where: { clientCompanyId },
      data: payload,
    });

    const { clientCompany, ...oldValue } = existing;

    await createAuditLog({
      userId: req.user.id,
      action: "UPDATE_PAYROLL_SETTING",
      entity: "PayrollSetting",
      entityId: updated.id,
      oldValue,
      newValue: payload,
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
      include: {
        clientCompany: {
          select: {
            companyId: true,
            managerId: true,
          },
        },
      },
    });

    if (!ensureSettingAccess(existing, req, res)) {
      return;
    }

    await prisma.payrollSetting.delete({
      where: { clientCompanyId },
    });

    const { clientCompany, ...oldValue } = existing;

    await createAuditLog({
      userId: req.user.id,
      action: "DELETE_PAYROLL_SETTING",
      entity: "PayrollSetting",
      entityId: existing.id,
      oldValue,
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
