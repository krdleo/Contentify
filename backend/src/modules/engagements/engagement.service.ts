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
