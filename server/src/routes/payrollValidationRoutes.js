import express from "express";
import {
  getPayrollValidation,
  validatePayroll,
  closePayroll,
  reopenPayroll,
} from "../controllers/payrollValidation.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Lecture
router.get(
  "/:payrollId",
  checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"),
  getPayrollValidation
);

// Validation
router.patch(
  "/:payrollId/validate",
  checkRole("SUPER_ADMIN", "ADMIN"),
  validatePayroll
);

// Clôture
router.patch(
  "/:payrollId/close",
  checkRole("SUPER_ADMIN", "ADMIN"),
  closePayroll
);

// Réouverture (exception)
router.patch(
  "/:payrollId/reopen",
  checkRole("SUPER_ADMIN"),
  reopenPayroll
);

export default router;
