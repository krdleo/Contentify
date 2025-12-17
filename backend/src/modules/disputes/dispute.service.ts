import { prisma } from '../../config/database';
import type { DisputeStatus } from '@prisma/client';

export const createDispute = async (engagementId: number, userId: number, reasonCode: string, description: string) => {
  const engagement = await prisma.engagement.findUnique({
    where: { id: engagementId },
    select: { businessId: true, freelancerId: true }
  });
  if (!engagement) throw new Error('ENGAGEMENT_NOT_FOUND');
  if (engagement.businessId !== userId && engagement.freelancerId !== userId) throw new Error('FORBIDDEN');

  return prisma.dispute.create({
    data: { engagementId, raisedById: userId, reasonCode, description }
  });
};

export const listMyDisputes = (userId: number) =>
  prisma.dispute.findMany({
    where: { OR: [{ raisedById: userId }, { engagement: { businessId: userId } }, { engagement: { freelancerId: userId } }] },
    orderBy: { createdAt: 'desc' }
  });

export const getDispute = async (id: number, userId: number, isAdmin?: boolean) => {
  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: { attachments: true, engagement: { select: { businessId: true, freelancerId: true } } }
  });
  if (!dispute) return null;

  const allowed =
    Boolean(isAdmin) ||
    dispute.raisedById === userId ||
    dispute.engagement.businessId === userId ||
    dispute.engagement.freelancerId === userId;

  if (!allowed) throw new Error('FORBIDDEN');
  return dispute;
};

export const addDisputeAttachment = (disputeId: number, fileUrl: string, description?: string) =>
  prisma.disputeAttachment.create({ data: { disputeId, fileUrl, description } });

export const listAdminDisputes = () => prisma.dispute.findMany({ orderBy: { createdAt: 'desc' } });

export const resolveDispute = (id: number, status: DisputeStatus, resolutionNotes?: string) =>
  prisma.dispute.update({ where: { id }, data: { status, resolutionNotes, resolvedAt: new Date() } });
