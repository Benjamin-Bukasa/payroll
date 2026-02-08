import express from "express";
import {
  generateMonthlyPayroll,
  getPayrollDashboard,
} from "../controllers/payroll.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/dashboard",
  checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"),
  getPayrollDashboard
);
router.post(
  "/generate",
  checkRole("SUPER_ADMIN", "ADMIN"),
  generateMonthlyPayroll
);

export default router;
