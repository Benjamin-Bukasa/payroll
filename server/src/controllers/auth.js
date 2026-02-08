import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../config/db.js";
import { PLAN_LIMITS, calculatePrice } from "../utils/subscription.js";
import { signAccessToken, signRefreshToken, verifyToken } from "../utils/jwt.js";
import { accessCookieOptions, refreshCookieOptions } from "../utils/cookies.js";
import { sendEmail } from "../services/email.js";



export const register = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    companyName,
  } = req.body;

  const emailExist = await prisma.user.findUnique({ where: { email } });
  if (emailExist) {
    return res.status(400).json({ message: "Email already used" });
  }

  const hash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 30);

  await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: companyName,
        email,
        phone: "",
        address: "",
      },
    });

    await tx.subscription.create({
      data: {
        plan: "TRIAL",
        startDate: now,
        endDate: trialEnd,
        companyId: company.id,
      },
    });

    await tx.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hash,
        role: "ADMIN",
        companyId: company.id,
        verificationToken,
      },
    });
  });

  const link = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;

  await sendEmail({
    to: email,
    subject: "Welcome to your 30-day free trial 🎉",
    html: `
      <p>Your TRIAL ends on <strong>${trialEnd.toDateString()}</strong></p>
      <p>No payment required now.</p>
      <a href="${link}">Verify your account</a>
    `,
  });

  res.status(201).json({
    message: "Trial account created. Check your email.",
    trialEndsAt: trialEnd,
  });
};



export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  const user = await prisma.user.findFirst({
    where: { verificationToken: token }
  });

  if (!user) return res.status(400).json({ message: "Invalid token" });

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationToken: null }
  });

  res.json({ message: "Account verified" });
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ===============================
    // VALIDATION INPUT
    // ===============================
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // ===============================
    // FIND USER
    // ===============================
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // ===============================
    // ACCOUNT CHECKS
    // ===============================
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before login",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is blocked. Contact administrator.",
      });
    }

    // ===============================
    // PASSWORD CHECK
    // ===============================
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        message: "Adresse email ou mot de passe incorrect",
      });
    }

    // ===============================
    // TOKEN GENERATION
    // ===============================
    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = signRefreshToken(user.id);

    // ===============================
    // STORE REFRESH TOKEN
    // ===============================
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      },
    });

    // ===============================
    // RESPONSE + COOKIES
    // ===============================
    res
      .cookie("access_token", accessToken, accessCookieOptions)
      .cookie("refresh_token", refreshToken, refreshCookieOptions)
      .status(200)
      .json({
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
        },
        // ⚠️ DEV ONLY (à retirer en prod)
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const refresh = async (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.sendStatus(401);

  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!stored || !stored.user) return res.sendStatus(403);

  if (!stored.user.isActive) {
    // FORCER LE LOGOUT
    await prisma.refreshToken.deleteMany({
      where: { userId: stored.user.id },
    });

    return res
      .clearCookie("access_token")
      .clearCookie("refresh_token")
      .status(403)
      .json({ message: "Account is blocked" });
  }

  const payload = verifyToken(
    token,
    process.env.JWT_REFRESH_SECRET
  );

  const accessToken = signAccessToken({
    userId: payload.userId,
    role: stored.user.role,
  });

  res
    .cookie("access_token", accessToken, accessCookieOptions)
    .json({ ok: true });
};


// controllers/auth.js
export const me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
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
      mustChangePassword: true,
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      clientCompanies:{
        select:{
          id:true,
          companyName: true,
          logo: true,
          activitySector:true,
        }
      },
      createdAt: true,
    },
  });

  res.json(user);
};



export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: new Date(Date.now() + 3600000)
    }
  });

  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset password",
    html: `<a href="${link}">Reset password</a>`
  });

  res.json({ message: "Email sent" });
};


export const resetPassword = async (req, res) => {
   const { token, password } = req.body;

    const user = await prisma.user.findFirst({
        where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() }
        }
    });

    if (!user) return res.status(400).json({ message: "Invalid token" });

    const hash = await bcrypt.hash(password, 12);

    await prisma.user.update({
        where: { id: user.id },
        data: {
        password: hash,
        resetPasswordToken: null,
        resetPasswordExpires: null
        }
    });

    res.json({ message: "Password updated" });
};



export const logout = async (req, res) => {
  const token = req.cookies.refresh_token;

  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  res
    .clearCookie("access_token")
    .clearCookie("refresh_token")
    .json({ message: "Logged out" });
};

 // Google Login, Le front envoie : { token: googleIdToken }

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Google token is required",
      });
    }

    // Vérifier le token Google
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );

    const googleUser = await googleRes.json();

    if (googleUser.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({
        message: "Invalid Google token",
      });
    }

    const { email, given_name, family_name, sub } = googleUser;

    if (!email) {
      return res.status(400).json({
        message: "Google account has no email",
      });
    }

    // Chercher l'utilisateur
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Bloqué ? → logout forcé
    if (user && !user.isActive) {
      return res.status(403).json({
        message: "Account is blocked",
      });
    }

    // 4Créer utilisateur si inexistant
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstname: given_name,
          lastname: family_name,
          googleId: sub,
          isVerified: true,
          role: "USER",
        },
      });
    }

    // Générer JWT
    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      },
    });

    // Cookies + réponse
    res
      .cookie("access_token", accessToken, accessCookieOptions)
      .cookie("refresh_token", refreshToken, refreshCookieOptions)
      .json({
        id: user.id,
        email: user.email,
        role: user.role,
      });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      message: "Google authentication failed",
    });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  const match = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!match) {
    return res.status(400).json({
      message: "Current password is incorrect",
    });
  }

  const hash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hash,
      mustChangePassword: false, // DÉBLOCAGE
    },
  });

  res.json({
    message: "Password changed successfully",
  });
};

