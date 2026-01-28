import { verifyToken } from "../utils/jwt.js";
import prisma from "../config/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Token depuis cookie httpOnly
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: token missing",
      });
    }

    // Vérification JWT
    const decoded = verifyToken(
      token,
      process.env.JWT_ACCESS_SECRET
    );


    // Vérifier l'utilisateur + isActive
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        isActive: true,
        companyId: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is blocked",
      });
    }

    //Injecter l'utilisateur
    req.user = {
      id: user.id,
      role: user.role,
      companyId: user.companyId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
