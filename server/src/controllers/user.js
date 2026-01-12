import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../config/db.js";
import { sendEmail } from "../services/email.js";
import { createAuditLog } from "../services/audit.js";

/**
 * CREATE USER (ADMIN / SUPER_ADMIN)
 * - Password temporaire
 * - Changement obligatoire au premier login
 */
export const createUser = async (req, res) => {
  const { firstname, lastname, email, role } = req.body;

  if (!["USER", "MANAGER"].includes(role)) {
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
  const { firstname, lastname, role, isActive } = req.body;

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

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      firstname,
      lastname,
      role,
      isActive,
    },
    select: {
      id: true,
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
  if (req.body.firstname) data.firstname = req.body.firstname;
  if (req.body.lastname) data.lastname = req.body.lastname;
  if (req.body.phone) data.phone = req.body.phone;

  // Avatar depuis Cloudinary
  if (req.file?.path) {
    data.avatar = req.file.path;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  await createAuditLog({
    userId,
    action: "UPDATE_PROFILE",
    entity: "User",
    entityId: userId,
  });

  res.json({
    message: "Profile updated",
    avatar: updatedUser.avatar,
  });
};


