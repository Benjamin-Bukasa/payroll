/**
 * ===================================================
 * RBAC Middleware
 * - Vérifie si le rôle de l'utilisateur est autorisé
 * - Supporte plusieurs rôles
 * ===================================================
 */
export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};

/**
 * ===================================================
 * PROTECTION ANTI AUTO-DOWNGRADE ADMIN
 * - Empêche un ADMIN de changer son propre rôle
 * - À utiliser AVANT le controller de changement de rôle
 * ===================================================
 */
export const preventAdminSelfDowngrade = (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      message: "userId is required",
    });
  }

  if (req.user.id === userId && req.user.role === "ADMIN") {
    return res.status(400).json({
      message: "ADMIN cannot downgrade their own role",
    });
  }

  next();
};
