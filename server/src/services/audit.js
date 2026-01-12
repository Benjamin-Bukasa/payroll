import prisma from "../config/db.js";

export const createAuditLog = async ({
  userId,
  action,
  entity,
  entityId,
  oldValue = null,
  newValue = null,
}) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
    },
  });
};
