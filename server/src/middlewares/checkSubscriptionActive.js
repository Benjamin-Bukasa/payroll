export const checkSubscriptionActive = async (req, res, next) => {
  const company = await prisma.company.findUnique({
    where: { id: req.user.companyId },
    include: { subscription: true },
  });

  const sub = company.subscription;

  if (!sub.isActive) {
    return res.status(402).json({
      message: "Subscription expired. Please upgrade your plan.",
    });
  }

  if (sub.plan === "TRIAL" && sub.endDate < new Date()) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { isActive: false },
    });

    return res.status(402).json({
      message: "Trial expired. Please subscribe.",
    });
  }

  next();
};
