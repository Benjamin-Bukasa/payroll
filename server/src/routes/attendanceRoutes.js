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
  listAttendances,
  createAttendanceManual,
  listAttendancesTable,
  getAttendanceById,
  recalculateAttendanceOvertime
} from "../controllers/attendance.js";

import {downloadAttendanceTemplate,} from "../controllers/attendanceTemplate.js";

import {importAttendance} from "../controllers/attendanceImport.js";


import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";
import { uploadImportFile } from "../middlewares/uploadImportFile.js";

const router = express.Router();


router.use(authMiddleware);
router.use(checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"));

router.get("/", listAttendances);

router.post("/create", createAttendanceManual );

router.post("/clock-in", clockIn);

router.get("/employee/:employeeId", listAttendanceByEmployee);

router.get("/table", listAttendancesTable)

router.patch("/:attendanceId", updateAttendance);

router.patch("/clock-out/:attendanceId", clockOut);

router.delete("/:attendanceId", deleteAttendance);

router.get("/template/excel",downloadAttendanceTemplate);

router.post("/import",uploadImportFile.single("file"),importAttendance);

router.post("/recalculate", recalculateAttendanceOvertime);

router.get("/:attendanceId", getAttendanceById);

export default router;
