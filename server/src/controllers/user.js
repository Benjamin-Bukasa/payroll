import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../config/db.js";
import { sendEmail } from "../services/email.js";
import { createAuditLog } from "../services/audit.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(
  __dirname,
  "..",
  "..",
  "uploads",
  "user-avatars"
);

const buildPublicPath = (filename) =>
  `/uploads/user-avatars/${filename}`;

const extractPublicPath = (value) => {
  if (!value) return null;
  if (value.startsWith("http")) {
    try {
      const parsed = new URL(value);
      return parsed.pathname;
    } catch {
      return null;
    }
  }
  return value;
};

const getAbsolutePath = (publicPath) => {
  if (!publicPath) return null;
  const fileName = path.basename(publicPath);
  return path.join(uploadDir, fileName);
};

const removeFileIfExists = async (publicPath) => {
  const normalizedPath = extractPublicPath(publicPath);
  if (
    !normalizedPath ||
    !normalizedPath.startsWith("/uploads/user-avatars/")
  ) {
    return;
  }

  const absolutePath = getAbsolutePath(normalizedPath);
  if (!absolutePath) return;

  try {
    await fs.promises.unlink(absolutePath);
  } catch {
    // ignore delete errors
  }
};

/**
 * CREATE USER (ADMIN / SUPER_ADMIN)
 * - Password temporaire
 * - Changement obligatoire au premier login
 */
export const createUser = async (req, res) => {
  const {
    firstname,
    lastname,
    familyname,
    position,
    email,
    role,
  } = req.body;

  if (!["USER", "MANAGER", "ADMIN"].includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  const exists = await prisma.user.findUnique({
    where: { email },
  });

  if (exists) {
    return res.status(400).json({
      message: "Email already used",
    });
  }

  // Mot de passe temporaire
  const tempPassword = crypto.randomBytes(6).toString("hex");
  const hash = await bcrypt.hash(tempPassword, 12);

  const user = await prisma.user.create({
    data: {
      firstname,
      lastname,
      familyname: familyname?.trim() || null,
      position: position?.trim() || null,
      email,
      password: hash,
      role,
      companyId: req.user.companyId,
      isActive: true,
      isVerified: true,
      mustChangePassword: true, // FORCÉ
    },
  });

  // Email au nouvel utilisateur
  await sendEmail({
    to: email,
    subject: "Your account has been created",
    html: `
      <p>Hello ${firstname},</p>
      <p>Your account has been created.</p>
      <p><strong>Temporary password:</strong> ${tempPassword}</p>
      <p>You must change your password at first login.</p>
    `,
  });

  res.status(201).json({
    message: "User created. Temporary password sent by email.",
    userId: user.id,
  });
};


export const listUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    where: {
      companyId: req.user.companyId,
    },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      familyname: true,
      position: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  res.json(users);
};


export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const {
    firstname,
    lastname,
    familyname,
    position,
    role,
    isActive,
  } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.companyId !== req.user.companyId) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // Empêcher downgrade admin
  if (
    req.user.id === userId &&
    ["ADMIN", "SUPER_ADMIN"].includes(req.user.role)
  ) {
    return res.status(400).json({
      message: "You cannot modify your own role",
    });
  }

  if (role && role === "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      firstname,
      lastname,
      familyname,
      position,
      role,
      isActive,
    },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      familyname: true,
      position: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  res.json(updated);
};


export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  if (req.user.id === userId) {
    return res.status(400).json({
      message: "You cannot delete yourself",
    });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.companyId !== req.user.companyId) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  res.json({ message: "User disabled" });
};




export const updateMyProfile = async (req, res) => {
  const userId = req.user.id;

  const data = {};
  if (req.body.firstname !== undefined) {
    data.firstname = String(req.body.firstname).trim();
  }
  if (req.body.lastname !== undefined) {
    data.lastname = String(req.body.lastname).trim();
  }
  if (req.body.familyname !== undefined) {
    const familyname = String(req.body.familyname).trim();
    data.familyname = familyname.length ? familyname : null;
  }
  if (req.body.position !== undefined) {
    const position = String(req.body.position).trim();
    data.position = position.length ? position : null;
  }
  if (req.body.phone !== undefined) {
    const phone = String(req.body.phone).trim();
    data.phone = phone.length ? phone : null;
  }

  let previousAvatar = null;
  if (req.file?.filename || req.file?.path) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });
    previousAvatar = existingUser?.avatar || null;
  }

  if (req.file?.filename) {
    const publicPath = buildPublicPath(req.file.filename);
    data.avatar = `${req.protocol}://${req.get(
      "host"
    )}${publicPath}`;
  } else if (req.file?.path) {
    // fallback if an external URL is provided
    data.avatar = req.file.path;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      firstname: true,
      lastname: true,
      familyname: true,
      position: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      isActive: true,
    },
  });

  if (req.file?.filename && previousAvatar) {
    await removeFileIfExists(previousAvatar);
  }

  await createAuditLog({
    userId,
    action: "UPDATE_PROFILE",
    entity: "User",
    entityId: userId,
  });

  res.json({
    message: "Profile updated",
    user: updatedUser,
  });
};

export const deleteMyAccount = async (req, res) => {
  const userId = req.user.id;

  if (req.user.role === "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Super admin account cannot be deleted",
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  await createAuditLog({
    userId,
    action: "DELETE_PROFILE",
    entity: "User",
    entityId: userId,
  });

  res.json({ message: "Account disabled" });
};


