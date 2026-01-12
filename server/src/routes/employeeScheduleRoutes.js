import express from "express";
import {
  createEmployeeSchedule,
  getEmployeeSchedules,
  getEmployeeScheduleById,
  updateEmployeeSchedule,
  deleteEmployeeSchedule,
} from "../controllers/employeeSchedule.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";

const router = express.Router();


router.use(authMiddleware);
router.use(checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"));


router.post("/:employeeId", createEmployeeSchedule);

router.get("/:employeeId", getEmployeeSchedules);

router.get("/schedule/:scheduleId", getEmployeeScheduleById);

router.patch("/schedule/:scheduleId", updateEmployeeSchedule);

router.delete("/schedule/:scheduleId", deleteEmployeeSchedule);



export default router;
