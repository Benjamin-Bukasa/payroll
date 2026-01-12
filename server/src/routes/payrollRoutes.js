import express from "express";
import { generateMonthlyPayroll } from "../controllers/payroll.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(checkRole("SUPER_ADMIN", "ADMIN"));

router.post("/generate", generateMonthlyPayroll);

export default router;
