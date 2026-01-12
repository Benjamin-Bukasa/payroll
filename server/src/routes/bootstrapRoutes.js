import express from "express";
import bcrypt from "bcrypt";
import prisma from "../config/db.js";

const router = express.Router();

/**
 * =====================================
 * BOOTSTRAP SUPER ADMIN (ONE TIME)
 * =====================================
 */
router.post("/super-admin", async (req, res) => {
  try {
    const existing = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (existing) {
      return res.status(403).json({
        message: "Super admin already exists",
      });
    }

    if (
      !process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL ||
      !process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD
    ) {
      return res.status(500).json({
        message: "Bootstrap environment variables missing",
      });
    }

    // Créer une company hôte
    const company = await prisma.company.create({
      data: {
        name: "NEOSYS HOST",
        email: process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL,
        phone: "+243000000000",
        address: "Kinshasa",
      },
    });

    const hashedPassword = await bcrypt.hash(
      process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD,
      12
    );

    const superAdmin = await prisma.user.create({
      data: {
        email: process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        firstname: "Super",
        lastname: "Admin",
        role: "SUPER_ADMIN",
        isVerified: true,
        companyId: company.id,
      },
    });

    res.status(201).json({
      message: "SUPER_ADMIN created successfully",
      credentials: {
        email: process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL,
        password: process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD,
      },
    });
  } catch (error) {
    console.error("Bootstrap error:", error);
    res.status(500).json({
      message: "Bootstrap failed",
    });
  }
});

export default router;
