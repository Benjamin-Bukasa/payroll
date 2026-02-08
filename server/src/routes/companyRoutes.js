import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";
import {
  getMyCompany,
  updateMyCompany,
  updateMyCompanyLogo,
} from "../controllers/company.js";
import { uploadCompanyLogo } from "../middlewares/uploadCompanyLogo.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/me", getMyCompany);

router.patch(
  "/me",
  checkRole("SUPER_ADMIN", "ADMIN"),
  updateMyCompany
);

router.patch(
  "/me/logo",
  checkRole("SUPER_ADMIN", "ADMIN"),
  uploadCompanyLogo.single("logo"),
  updateMyCompanyLogo
);

export default router;
