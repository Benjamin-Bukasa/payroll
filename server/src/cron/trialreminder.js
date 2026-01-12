import prisma from "../config/db.js";
import { sendEmail } from "../services/email.js";

export const trialReminderJob = async () => {
  const today = new Date();

  const trials = await prisma.subscription.findMany({
    where: {
      plan: "TRIAL",
      isActive: true,
    },
    include: {
      company: {
        include: { users: { where: { role: "ADMIN" } } },
      },
    },
  });

  for (const sub of trials) {
    const daysLeft = Math.ceil(
      (sub.endDate - today) / (1000 * 60 * 60 * 24)
    );

    const admin = sub.company.users[0];
    if (!admin) continue;

    if (daysLeft === 14 && !sub.trialNotified14) {
      await sendEmail({
        to: admin.email,
        subject: "⏳ Trial ends in 14 days",
        html: `<p>Your trial ends in 14 days. Upgrade to continue.</p>`,
      });
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { trialNotified14: true },
      });
    }

    if (daysLeft === 7 && !sub.trialNotified7) {
      await sendEmail({
        to: admin.email,
        subject: "⚠️ Trial ends in 7 days",
        html: `<p>Your trial ends in 7 days.</p>`,
      });
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { trialNotified7: true },
      });
    }

    if (daysLeft === 0 && !sub.trialNotified0) {
      await sendEmail({
        to: admin.email,
        subject: "🚨 Trial ends today",
        html: `<p>Your trial ends today. Payment required.</p>`,
      });
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { trialNotified0: true },
      });
    }
  }
};
