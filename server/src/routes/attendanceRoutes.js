import express from "express";

/* =========================
   CONTROLLERS
========================= */
import {
  clockIn,
  clockOut,
  listAttendanceByEmployee,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendance.js";

import {downloadAttendanceTemplate,} from "../controllers/attendanceTemplate.js";

import {importAttendance,} from "../controllers/attendanceImport.js";


import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";
import { uploadImportFile } from "../middlewares/uploadImportFile.js";

const router = express.Router();


router.use(authMiddleware);
router.use(checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"));


router.post("/clock-in", clockIn);

router.patch("/clock-out/:attendanceId", clockOut);

router.get("/employee/:employeeId", listAttendanceByEmployee);

router.patch("/:attendanceId", updateAttendance);

router.delete("/:attendanceId", deleteAttendance);

router.get("/template/excel",downloadAttendanceTemplate);

router.post("/import",uploadImportFile.single("file"),importAttendance);

export default router;
