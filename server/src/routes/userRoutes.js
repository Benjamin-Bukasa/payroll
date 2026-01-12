import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/rbacMiddleware.js";
import { checkUserLimit } from "../middlewares/checkUserLimit.js";
import { uploadAvatar } from "../middlewares/uploadAvatar.js";
import {
  createUser,
  listUsers,
  updateUser,
  deleteUser,
  updateMyProfile
} from "../controllers/user.js";

const router = express.Router();

router.use(authMiddleware);
router.use(checkRole("SUPER_ADMIN", "ADMIN"));

router.post("/create-user", checkUserLimit, createUser);
router.get("/getAll-users", listUsers);
router.patch("/:userId", updateUser);
router.delete("/:userId", deleteUser);

router.patch("/me/avatar",uploadAvatar.single("avatar"),updateMyProfile);


export default router;
