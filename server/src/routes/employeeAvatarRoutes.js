import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";
import {
  uploadEmployeeAvatar,
  MAX_EMPLOYEE_AVATAR_SIZE,
} from "../middlewares/uploadEmployeeAvatar.js";
import {
  getEmployeeAvatar,
  updateEmployeeAvatar,
  deleteEmployeeAvatar,
} from "../controllers/employeeAvatar.js";

const router = express.Router();

router.use(authMiddleware);
router.use(checkRole("SUPER_ADMIN", "ADMIN", "MANAGER"));

router.get("/:employeeId", getEmployeeAvatar);
router.post(
  "/:employeeId",
  uploadEmployeeAvatar.single("avatar"),
  updateEmployeeAvatar
);
router.patch(
  "/:employeeId",
  uploadEmployeeAvatar.single("avatar"),
  updateEmployeeAvatar
);
router.delete("/:employeeId", deleteEmployeeAvatar);

router.use((err, _req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    const maxMb = Math.round(
      MAX_EMPLOYEE_AVATAR_SIZE / (1024 * 1024)
    );
    return res.status(413).json({
      message: `File too large. Max ${maxMb}MB.`,
    });
  }

  if (err?.name === "MulterError") {
    return res.status(400).json({
      message: err.message || "Upload error",
    });
  }

  if (err) {
    return res.status(400).json({
      message: err.message || "Upload error",
    });
  }

  next();
});

export default router;
