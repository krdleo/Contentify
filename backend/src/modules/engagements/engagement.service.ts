import { prisma } from '../../config/database';
import type { EngagementStatus, MilestoneStatus, UserRole } from '@prisma/client';

export const createEngagementFromBid = async (bidId: number, businessId: number) => {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { project: { include: { milestones: true } } }
  });
  if (!bid) throw new Error('BID_NOT_FOUND');

  if (bid.project.businessId !== businessId) throw new Error('FORBIDDEN');

  const existingEngagement = await prisma.engagement.findUnique({ where: { bidId: bid.id } });
  if (existingEngagement) {
    if (bid.status !== 'ACCEPTED') {
      await prisma.bid.update({ where: { id: bid.id }, data: { status: 'ACCEPTED' } });
    }
    return { engagement: existingEngagement, created: false };
  }

  try {
    const engagement = await prisma.$transaction(async (tx) => {
      const createdEngagement = await tx.engagement.create({
        data: {
          bidId: bid.id,
          projectId: bid.projectId,
          businessId: bid.project.businessId,
          freelancerId: bid.freelancerId,
          status: 'NEGOTIATION'
        }
      });

      if (bid.project?.milestones?.length) {
        await tx.milestone.createMany({
          data: bid.project.milestones.map((m) => ({
            engagementId: createdEngagement.id,
            title: m.title,
            description: m.description,
            amount: m.amount,
            dueDate: null,
            sequenceOrder: m.sequenceOrder,
            status: 'PENDING'
          }))
        });
      }

      await tx.bid.update({ where: { id: bid.id }, data: { status: 'ACCEPTED' } });

      return createdEngagement;
    });

    return { engagement, created: true };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const engagement = await prisma.engagement.findUnique({ where: { bidId: bid.id } });
      if (engagement) return { engagement, created: false };
    }
    throw error;
  }
};

export const getEngagement = async (id: number) => {
  const engagement = await prisma.engagement.findUnique({
    where: { id },
    include: {
      milestones: { orderBy: { sequenceOrder: 'asc' } },
      project: { select: { id: true, title: true } },
      business: { select: { id: true, user: { select: { email: true } } } },
      freelancer: { select: { id: true, user: { select: { email: true } } } }
    }
  });

  if (!engagement) return null;

  return {
    ...engagement,
    business: engagement.business ? { id: engagement.business.id, email: engagement.business.user.email } : null,
    freelancer: engagement.freelancer ? { id: engagement.freelancer.id, email: engagement.freelancer.user.email } : null
  };
};

export const listEngagementsForUser = async (userId: number, role: string) => {
  const where = role === 'BUSINESS' ? { businessId: userId } : { freelancerId: userId };

  const rows = await prisma.engagement.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      project: { select: { id: true, title: true } },
      business: { select: { id: true, user: { select: { email: true } } } },
      freelancer: { select: { id: true, user: { select: { email: true } } } }
    }
  });

  return rows.map((e) => ({
    ...e,
    business: e.business ? { id: e.business.id, email: e.business.user.email } : null,
    freelancer: e.freelancer ? { id: e.freelancer.id, email: e.freelancer.user.email } : null
  }));
};

export const updateEngagementStatus = async (id: number, status: EngagementStatus, userId: number, role: UserRole) => {
  const engagement = await prisma.engagement.findUnique({ where: { id }, select: { businessId: true, freelancerId: true } });
  if (!engagement) throw new Error('ENGAGEMENT_NOT_FOUND');

  const canAct =
    role === 'BUSINESS' ? engagement.businessId === userId : role === 'FREELANCER' ? engagement.freelancerId === userId : false;

  if (status === 'CANCELLED') {
    if (!canAct) throw new Error('FORBIDDEN');
  } else {
    if (role !== 'BUSINESS' || !canAct) throw new Error('FORBIDDEN');
  }

  return prisma.engagement.update({ where: { id }, data: { status } });
};

export const updatePaymentStatus = (id: number, paymentStatus: string, paymentNotes?: string) =>
  prisma.engagement.update({ where: { id }, data: { paymentStatus: paymentStatus as any, paymentNotes } });

export const markFreelancerReceived = (id: number) =>
  prisma.engagement.update({ where: { id }, data: { freelancerMarkedReceived: true, freelancerMarkedReceivedAt: new Date() } });

export const createMilestones = (engagementId: number, milestones: { title: string; amount: number; dueDate?: Date | null; description?: string; sequenceOrder: number }[]) =>
  prisma.milestone.createMany({
    data: milestones.map((m) => ({
      engagementId,
      title: m.title,
      amount: m.amount,
      dueDate: m.dueDate ?? null,
      description: m.description,
      sequenceOrder: m.sequenceOrder,
      status: 'PENDING'
    }))
  });

export const listMilestones = (engagementId: number) => prisma.milestone.findMany({ where: { engagementId }, orderBy: { sequenceOrder: 'asc' } });

export const updateMilestone = async (
  id: number,
  data: Partial<{ title: string; description?: string; amount: number; dueDate?: Date | null }>,
  userId: number
) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { engagement: { select: { businessId: true } } }
  });
  if (!milestone) throw new Error('MILESTONE_NOT_FOUND');
  if (milestone.engagement.businessId !== userId) throw new Error('FORBIDDEN');

  return prisma.milestone.update({ where: { id }, data });
};

export const setMilestoneStatus = async (id: number, status: MilestoneStatus, userId: number, role: UserRole) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { engagement: { select: { businessId: true, freelancerId: true } } }
  });
  if (!milestone) throw new Error('MILESTONE_NOT_FOUND');

  const isBusiness = role === 'BUSINESS' && milestone.engagement.businessId === userId;
  const isFreelancer = role === 'FREELANCER' && milestone.engagement.freelancerId === userId;

  if (status === 'SUBMITTED') {
    if (!isFreelancer) throw new Error('FORBIDDEN');
  } else if (status === 'APPROVED' || status === 'REJECTED') {
    if (!isBusiness) throw new Error('FORBIDDEN');
  } else {
    if (!isBusiness) throw new Error('FORBIDDEN');
  }

  return prisma.milestone.update({ where: { id }, data: { status } });
};

export const addDeliverable = (milestoneId: number, fileUrl: string, notes?: string) =>
  prisma.milestoneDeliverable.create({ data: { milestoneId, fileUrl, notes } });

export const listDeliverables = (milestoneId: number) =>
  prisma.milestoneDeliverable.findMany({ where: { milestoneId }, orderBy: { submittedAt: 'asc' } });
