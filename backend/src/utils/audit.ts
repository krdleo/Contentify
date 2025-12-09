import { prisma } from '../config/database';

export const createAuditLog = async (
  userId: number | undefined,
  action: string,
  entityType: string,
  entityId?: number,
  after?: any,
  before?: any
) =>
  prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      after,
      before
    }
  });
