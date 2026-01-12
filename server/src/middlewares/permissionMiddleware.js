export const canReadPayroll = (req, res, next) => {
  const allowedRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER"];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: "Read access denied",
    });
  }

  next();
};

export const canWritePayroll = (req, res, next) => {
  const allowedRoles = ["SUPER_ADMIN", "ADMIN"];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: "Write access denied",
    });
  }

  next();
};
