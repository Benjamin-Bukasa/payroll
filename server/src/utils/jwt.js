import jwt from "jsonwebtoken";

/**
 * Access Token (court)
 * Contient userId + role
 */
export const signAccessToken = ({ userId, role }) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

/**
 * Refresh Token (long)
 * Contient uniquement userId
 */
export const signRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/**
 * Vérification générique
 */
export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
