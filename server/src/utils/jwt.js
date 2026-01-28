import jwt from "jsonwebtoken";

/**
 * =====================================
 * ACCESS TOKEN (court)
 * - Contient userId + role
 * - Utilisé pour l'auth + RBAC
 * =====================================
 */
export const signAccessToken = ({ userId, role }) => {
  if (!userId || !role) {
    throw new Error("signAccessToken requires userId and role");
  }

  return jwt.sign(
    {
      userId,
      role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

/**
 * =====================================
 * REFRESH TOKEN (long)
 * - Contient uniquement userId
 * - Stocké en DB
 * =====================================
 */
export const signRefreshToken = (userId) => {
  if (!userId) {
    throw new Error("signRefreshToken requires userId");
  }

  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/**
 * =====================================
 * VÉRIFICATION GÉNÉRIQUE JWT
 * =====================================
 */
export const verifyToken = (token, secret) => {
  if (!token || !secret) {
    throw new Error("verifyToken requires token and secret");
  }

  return jwt.verify(token, secret);
};


