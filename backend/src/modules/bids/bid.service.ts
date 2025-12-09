import { prisma } from '../../config/database';

export const createBid = async (projectId: number, freelancerId: number, data: any) =>
  prisma.bid.create({ data: { ...data, projectId, freelancerId } });

export const listProjectBids = async (projectId: number) => prisma.bid.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });

export const listMyBids = async (freelancerId: number) => prisma.bid.findMany({ where: { freelancerId } });

export const updateBidStatus = (id: number, status: string) => prisma.bid.update({ where: { id }, data: { status } });
