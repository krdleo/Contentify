import { prisma } from '../../config/database';
import type { BidStatus } from '@prisma/client';

export const createBid = async (projectId: number, freelancerId: number, data: any) =>
  prisma.bid.create({ data: { ...data, projectId, freelancerId } });

export const placeBid = createBid;

export const listProjectBids = async (projectId: number) =>
  prisma.bid.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });

export const getBidsByProject = listProjectBids;

export const listMyBids = async (freelancerId: number) => prisma.bid.findMany({ where: { freelancerId } });

export const updateBidStatus = async (id: number, status: BidStatus, userId: number) => {
  const bid = await prisma.bid.findUnique({ where: { id }, include: { project: true } });
  if (!bid) throw new Error('BID_NOT_FOUND');
  if (bid.project.businessId !== userId) throw new Error('FORBIDDEN');

  return prisma.bid.update({ where: { id }, data: { status } });
};
