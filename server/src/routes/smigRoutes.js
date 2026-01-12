import express from "express";
import {
  createSmig,
  listSmig,
  getSmigById,
  updateSmig,
  deleteSmig,
} from "../controllers/smig.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

/* =========================
   SECURITY
========================= */
router.use(authMiddleware);
router.use(checkRole("SUPER_ADMIN", "ADMIN"));

/* =========================
   SMIG CRUD
========================= */

router.post("/", createSmig);

router.get("/", listSmig);

router.get("/:smigId", getSmigById);

router.patch("/:smigId", updateSmig);

router.delete("/:smigId", deleteSmig);

export default router;
