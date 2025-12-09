import { prisma } from '../../config/database';

export const createProject = async (businessId: number, data: any) =>
  prisma.project.create({ data: { ...data, businessId } });

export const listProjects = async (filters: { page: number; pageSize: number; category?: string }) => {
  const where: Record<string, any> = { status: 'OPEN' };
  if (filters.category) where.category = filters.category;
  const total = await prisma.project.count({ where });
  const items = await prisma.project.findMany({ where, skip: (filters.page - 1) * filters.pageSize, take: filters.pageSize });
  return { items, total };
};

export const getProject = async (id: number) => prisma.project.findUnique({ where: { id }, include: { attachments: true } });

export const listMyProjects = async (businessId: number) => prisma.project.findMany({ where: { businessId } });
