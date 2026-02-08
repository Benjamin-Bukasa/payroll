import express from "express";
import {
  listPayrollPeriods,
  getPayrollPeriod,
  createPayrollPeriod,
  closePayrollPeriod,
  reopenPayrollPeriod,
} from "../controllers/payrollPeriod.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Lecture
router.get(
  "/",
  checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"),
  listPayrollPeriods
);

router.post(
  "/",
  checkRole("SUPER_ADMIN", "ADMIN"),
  createPayrollPeriod
);

router.get(
  "/:periodId",
  checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"),
  getPayrollPeriod
);

// Clôture
router.patch(
  "/:periodId/close",
  checkRole("SUPER_ADMIN", "ADMIN"),
  closePayrollPeriod
);

// Réouverture (exception)
router.patch(
  "/:periodId/reopen",
  checkRole("SUPER_ADMIN", "ADMIN"),
  reopenPayrollPeriod
);

export default router;
