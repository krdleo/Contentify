import { prisma } from '../../config/database';

export const createEngagementFromBid = async (bidId: number) => {
  const bid = await prisma.bid.findUnique({ where: { id: bidId }, include: { project: true } });
  if (!bid) throw new Error('BID_NOT_FOUND');
  return prisma.engagement.create({
    data: {
      bidId: bid.id,
      projectId: bid.projectId,
      businessId: bid.project.businessId,
      freelancerId: bid.freelancerId,
      status: 'NEGOTIATION'
    }
  });
};

export const getEngagement = async (id: number) =>
  prisma.engagement.findUnique({ where: { id }, include: { milestones: true } });

export const listEngagementsForUser = async (userId: number, role: string) => {
  if (role === 'BUSINESS') {
    return prisma.engagement.findMany({ where: { businessId: userId } });
  }
  return prisma.engagement.findMany({ where: { freelancerId: userId } });
};

export const updateEngagementStatus = (id: number, status: string) =>
  prisma.engagement.update({ where: { id }, data: { status } });

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

export const updateMilestone = (id: number, data: Partial<{ title: string; description?: string; amount: number; dueDate?: Date | null }>) =>
  prisma.milestone.update({ where: { id }, data });

export const setMilestoneStatus = (id: number, status: string) => prisma.milestone.update({ where: { id }, data: { status } });

export const addDeliverable = (milestoneId: number, fileUrl: string, notes?: string) =>
  prisma.milestoneDeliverable.create({ data: { milestoneId, fileUrl, notes } });

export const listDeliverables = (milestoneId: number) =>
  prisma.milestoneDeliverable.findMany({ where: { milestoneId }, orderBy: { submittedAt: 'asc' } });
