import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";
import {
  createSchedule,
  getSchedule,
  listSchedules,
  updateSchedule,
  deleteSchedule,
} from "../controllers/clientCompanySchedule.js";

const router = express.Router();

router.use(authMiddleware);
router.use(checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"));

router.post("/", createSchedule);
router.get("/", listSchedules);
router.get("/:clientCompanyId", getSchedule);
router.patch("/:clientCompanyId", updateSchedule);
router.delete("/:clientCompanyId", deleteSchedule);

export default router;
