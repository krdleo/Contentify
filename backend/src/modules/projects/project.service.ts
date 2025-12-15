import { prisma } from '../../config/database';

export const createProject = async (businessId: number, data: any) => {
  const { milestones, ...projectData } = data;

  return prisma.project.create({
    data: {
      ...projectData,
      businessId,
      milestones: milestones?.length
        ? {
            create: milestones.map((m: any, i: number) => ({
              title: m.title,
              description: m.description,
              amount: m.amount,
              sequenceOrder: m.sequenceOrder ?? i + 1
            }))
          }
        : undefined
    },
    include: {
      attachments: true,
      milestones: { orderBy: { sequenceOrder: 'asc' } }
    }
  });
};

export const listProjects = async (filters: { page: number; pageSize: number; category?: string }) => {
  const where: Record<string, any> = { status: 'OPEN' };
  if (filters.category) where.category = filters.category;
  const total = await prisma.project.count({ where });
  const items = await prisma.project.findMany({
    where,
    skip: (filters.page - 1) * filters.pageSize,
    take: filters.pageSize,
    include: { milestones: { orderBy: { sequenceOrder: 'asc' } } }
  });
  return { items, total };
};

export const getProject = async (id: number) =>
  prisma.project.findUnique({
    where: { id },
    include: { attachments: true, milestones: { orderBy: { sequenceOrder: 'asc' } } }
  });

export const listMyProjects = async (businessId: number) =>
  prisma.project.findMany({
    where: { businessId },
    include: { milestones: { orderBy: { sequenceOrder: 'asc' } } }
  });
