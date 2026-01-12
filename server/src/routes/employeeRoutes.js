import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";
import { checkClientCompanyAccess } from "../middlewares/checkClientCompany.js";

import { importEmployees } from "../controllers/employeeImport.js";
import { downloadEmployeeTemplate } from "../controllers/employeeTemplate.js";
import { uploadImportFile } from "../middlewares/uploadImportFile.js";


import {
  createEmployee,
  listEmployees,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.js";

const router = express.Router();

router.use(authMiddleware);
router.use(checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"));

router.post("/create", checkClientCompanyAccess, createEmployee);

router.get(
  "/",
  checkRole("SUPER_ADMIN", "ADMIN", "MANAGER", "USER"),
  listEmployees
);

router.get(
  "/client-company/:clientCompanyId",
  checkClientCompanyAccess,
  listEmployees
);

router.patch("/:employeeId", updateEmployee);

router.delete(
  "/:employeeId",
  checkRole("SUPER_ADMIN", "ADMIN"),
  deleteEmployee
);

router.post(
  "/import",
  authMiddleware,
  checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"),
  uploadImportFile.single("file"),
  importEmployees
);

router.get(
  "/template/excel",
  authMiddleware,
  checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"),
  downloadEmployeeTemplate
);

export default router;
