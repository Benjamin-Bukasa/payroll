import express from "express";
import {
  getPayrollSetting,
  createPayrollSetting,
  updatePayrollSetting,
  deletePayrollSetting,
} from "../controllers/payrollSetting.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

/* =========================
   SECURITY
========================= */
router.use(authMiddleware);
router.use(checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"));

/* =========================
   PAYROLL SETTING CRUD
========================= */

// GET by ClientCompany
router.get(
  "/:clientCompanyId",
  getPayrollSetting
);

// CREATE
router.post(
  "/",
  createPayrollSetting
);

// UPDATE
router.patch(
  "/:clientCompanyId",
  updatePayrollSetting
);

// DELETE
router.delete(
  "/:clientCompanyId",
  deletePayrollSetting
);

export default router;
