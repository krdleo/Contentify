import { prisma } from '../../config/database';

export const listPortfolio = async (freelancerId: number) =>
  prisma.portfolioItem.findMany({ where: { freelancerId, isPublic: true } });

export const createPortfolioItem = async (freelancerId: number, data: any) =>
  prisma.portfolioItem.create({ data: { ...data, freelancerId } });

export const updatePortfolioItem = async (freelancerId: number, itemId: number, data: any) =>
  prisma.portfolioItem.update({ where: { id: itemId, freelancerId }, data });

export const deletePortfolioItem = async (freelancerId: number, itemId: number) =>
  prisma.portfolioItem.delete({ where: { id: itemId, freelancerId } });
