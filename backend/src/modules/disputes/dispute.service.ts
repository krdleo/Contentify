import { prisma } from '../../config/database';

export const createDispute = (engagementId: number, raisedById: number, reasonCode: string, description: string) =>
  prisma.dispute.create({
    data: { engagementId, raisedById, reasonCode, description }
  });

export const listMyDisputes = (userId: number) =>
  prisma.dispute.findMany({
    where: { OR: [{ raisedById: userId }, { engagement: { businessId: userId } }, { engagement: { freelancerId: userId } }] },
    orderBy: { createdAt: 'desc' }
  });

export const getDispute = (id: number) => prisma.dispute.findUnique({ where: { id }, include: { attachments: true } });

export const addDisputeAttachment = (disputeId: number, fileUrl: string, description?: string) =>
  prisma.disputeAttachment.create({ data: { disputeId, fileUrl, description } });

export const listAdminDisputes = () => prisma.dispute.findMany({ orderBy: { createdAt: 'desc' } });

export const resolveDispute = (id: number, status: string, resolutionNotes?: string) =>
  prisma.dispute.update({ where: { id }, data: { status, resolutionNotes, resolvedAt: new Date() } });
