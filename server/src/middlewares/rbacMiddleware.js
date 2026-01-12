export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // SUPER_ADMIN bypass
    if (req.user.role === "SUPER_ADMIN") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

export const preventAdminSelfDowngrade = (req, res, next) => {
  const { userId } = req.body;

  if (
    req.user.id === userId &&
    ["ADMIN", "SUPER_ADMIN"].includes(req.user.role)
  ) {
    return res.status(400).json({
      message: "You cannot downgrade your own role",
    });
  }

  next();
};
