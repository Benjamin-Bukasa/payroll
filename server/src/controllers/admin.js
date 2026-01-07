import prisma from "../config/db.js";

export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "isActive must be a boolean",
    });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      email: true,
      isActive: true,
    },
  });

  // 🔥 Invalider tous les refresh tokens si blocage
  if (!isActive) {
    await prisma.refreshToken.deleteMany({
      where: { userId: id },
    });
  }

  res.json({
    message: `User ${isActive ? "activated" : "blocked"} successfully`,
    user,
  });
};
