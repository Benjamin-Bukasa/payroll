import express from "express";
import {
  createClientCompany,
  listClientCompanies,
  getClientCompanyById,
  updateClientCompany,
  deleteClientCompany,
} from "../controllers/clientCompany.js";

import { uploadImportFile } from "../middlewares/uploadImportFile.js";
import { downloadClientCompanyTemplate } from "../controllers/clientCompanyTemplate.js";
import { importClientCompanies } from "../controllers/clientCompanyImport.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

/* CREATE */
router.post(
  "/create",
  checkRole("SUPER_ADMIN", "ADMIN"),
  createClientCompany
);

/* LIST */
router.get(
  "/getall",
  checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"),
  listClientCompanies
);

/* GET ONE */
router.get(
  "/:clientCompanyId",
  checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"),
  getClientCompanyById
);

/* UPDATE */
router.patch(
  "/:clientCompanyId",
  checkRole("SUPER_ADMIN", "ADMIN"),
  updateClientCompany
);

/* DELETE */
router.delete(
  "/:clientCompanyId",
  checkRole("SUPER_ADMIN", "ADMIN"),
  deleteClientCompany
);


router.post(
  "/import",
  authMiddleware,
  checkRole("SUPER_ADMIN", "ADMIN"),
  uploadImportFile.single("file"),
  importClientCompanies
);

router.get(
  "/template/excel",
  authMiddleware,
  checkRole("SUPER_ADMIN", "ADMIN"),
  downloadClientCompanyTemplate
);


export default router;
