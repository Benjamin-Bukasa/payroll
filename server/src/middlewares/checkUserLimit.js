import prisma from "../config/db.js";
import { PLAN_LIMITS } from "../utils/subscription.js";

export const checkUserLimit = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: true,
        users: true,
      },
    });

    if (!company || !company.subscription) {
      return res.status(403).json({
        message: "No active subscription",
      });
    }

    if (!company.subscription.isActive) {
      return res.status(402).json({
        message: "Subscription inactive",
      });
    }

    const plan = company.subscription.plan;
    const limit = PLAN_LIMITS[plan];

    if (limit !== Infinity && company.users.length >= limit) {
      return res.status(403).json({
        message: `User limit reached for ${plan} plan`,
      });
    }

    next();
  } catch (error) {
    console.error("checkUserLimit error:", error);
    res.status(500).json({
      message: "Unable to check user limit",
    });
  }
};
