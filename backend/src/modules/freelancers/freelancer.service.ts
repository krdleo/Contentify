import { prisma } from '../../config/database';

export const getMyFreelancerProfile = async (userId: number) =>
  prisma.freelancerProfile.findUnique({ where: { id: userId }, include: { skills: { include: { skill: true } }, portfolioItems: true } });

export const updateFreelancerProfile = async (userId: number, data: Record<string, any>) =>
  prisma.freelancerProfile.update({ where: { id: userId }, data });

export const getFreelancerPublic = async (id: number) =>
  prisma.freelancerProfile.findUnique({ where: { id }, include: { skills: { include: { skill: true } }, portfolioItems: true } });

export const listFreelancers = async (filters: { category?: string; city?: string; page: number; pageSize: number }) => {
  const where: Record<string, any> = {};
  if (filters.category) where.primaryCategory = filters.category;
  if (filters.city) where.city = filters.city;
  const total = await prisma.freelancerProfile.count({ where });
  const items = await prisma.freelancerProfile.findMany({
    where,
    skip: (filters.page - 1) * filters.pageSize,
    take: filters.pageSize,
    include: { skills: { include: { skill: true } }, portfolioItems: true }
  });
  return { items, total };
};
