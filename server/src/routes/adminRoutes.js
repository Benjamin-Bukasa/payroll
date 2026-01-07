import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";
import { toggleUserStatus } from "../controllers/admin.js";

const router = express.Router();

// ADMIN & SUPER_ADMIN seulement
router.patch("/users/:id/status",authMiddleware,
        checkRole("ADMIN", "SUPER_ADMIN"),
        toggleUserStatus
);

export default router;
