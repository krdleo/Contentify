import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../config/database';
import { createProject, getProjects, listMyProjects } from './project.service';

vi.mock('../../config/database', () => ({
  prisma: {
    project: {
      create: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('project.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createProject calls prisma.project.create with milestones and businessId', async () => {
    const data = {
      title: 'Project A',
      description: 'Desc',
      milestones: [
        { title: 'M1', description: 'First', amount: 100 },
        { title: 'M2', description: 'Second', amount: 200, sequenceOrder: 5 },
      ],
    };

    const mockCreated = { id: 1, ...data, businessId: 9 };
    vi.mocked(prisma.project.create).mockResolvedValue(mockCreated as any);

    const result = await createProject(9, data);

    expect(prisma.project.create).toHaveBeenCalledWith({
      data: {
        title: 'Project A',
        description: 'Desc',
        expectedEndDate: undefined,
        businessId: 9,
        milestones: {
          create: [
            { title: 'M1', description: 'First', amount: 100, sequenceOrder: 1 },
            { title: 'M2', description: 'Second', amount: 200, sequenceOrder: 5 },
          ],
        },
      },
      include: {
        attachments: true,
        milestones: { orderBy: { sequenceOrder: 'asc' } },
      },
    });
    expect(result).toEqual(mockCreated);
  });

  it('maps deadline to expectedEndDate and does not pass deadline to prisma', async () => {
    vi.mocked(prisma.project.create).mockResolvedValue({ id: 1 } as any);

    await createProject(5, {
      title: 't',
      description: 'd',
      category: 'c',
      budgetType: 'FIXED',
      budgetAmount: 300,
      locationType: 'REMOTE',
      visibility: 'PUBLIC',
      deadline: '2025-12-20',
      milestones: [{ title: 'm1', amount: 300, sequenceOrder: 1 }],
    });

    const callArg = vi.mocked(prisma.project.create).mock.calls[0]?.[0] as any;
    expect(callArg.data.deadline).toBeUndefined();
    expect(callArg.data.expectedEndDate).toBeInstanceOf(Date);
  });

  it('throws INVALID_DEADLINE_DATE when deadline is not a valid date', async () => {
    await expect(
      createProject(5, {
        title: 't',
        description: 'd',
        category: 'c',
        budgetType: 'FIXED',
        budgetAmount: 300,
        locationType: 'REMOTE',
        visibility: 'PUBLIC',
        deadline: 'not-a-date',
      })
    ).rejects.toThrow('INVALID_DEADLINE_DATE');

    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it('getProjects applies OPEN status, optional category filter, and pagination', async () => {
    const mockProjects = [{ id: 1 } as any, { id: 2 } as any];
    vi.mocked(prisma.project.count).mockResolvedValue(mockProjects.length);
    vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects as any);

    const result = await getProjects({ page: 2, pageSize: 3, category: 'WEB' });

    expect(prisma.project.count).toHaveBeenCalledWith({ where: { status: 'OPEN', category: 'WEB' } });
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { status: 'OPEN', category: 'WEB' },
      skip: 3,
      take: 3,
      include: { milestones: { orderBy: { sequenceOrder: 'asc' } } },
    });
    expect(result).toEqual({ items: mockProjects, total: mockProjects.length });
  });

  it('listMyProjects filters by businessId', async () => {
    const ownedProjects = [{ id: 10, businessId: 4 } as any];
    vi.mocked(prisma.project.findMany).mockResolvedValue(ownedProjects as any);

    const result = await listMyProjects(4);

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      where: { businessId: 4 },
      include: { milestones: { orderBy: { sequenceOrder: 'asc' } } },
    });
    expect(result).toEqual(ownedProjects);
  });

  it('createProject propagates errors from prisma.project.create', async () => {
    vi.mocked(prisma.project.create).mockRejectedValue(new Error('DB_FAIL'));

    await expect(createProject(1, { title: 'X' })).rejects.toThrow('DB_FAIL');
  });
});
