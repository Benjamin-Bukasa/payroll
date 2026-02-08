import express from "express";
import {
  register,
  verifyEmail,
  login,
  googleLogin,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
  changePassword
} from "../controllers/auth.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/register", register);

router.get("/verify-email", verifyEmail);

router.post("/login", login);

router.post("/google", googleLogin);

router.post("/refresh", refresh);

router.post("/logout",authMiddleware, logout);

router.get("/me", authMiddleware, me);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.patch(
  "/change-password",
  authMiddleware,
  changePassword
);




export default router;
