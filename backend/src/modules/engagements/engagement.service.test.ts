import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEngagementFromBid, listEngagementsForUser } from './engagement.service';
import { prisma } from '../../config/database';

vi.mock('../../config/database', () => ({
  prisma: {
    bid: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    engagement: {
      findUnique: vi.fn(),
      findMany: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

describe('engagement.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEngagementFromBid', () => {
    it('creates engagement, milestones, and marks bid accepted', async () => {
      const bid = {
        id: 1,
        projectId: 10,
        freelancerId: 20,
        status: 'SUBMITTED',
        project: {
          businessId: 99,
          milestones: [{ title: 'M1', description: 'Desc', amount: 1000, sequenceOrder: 1 }]
        }
      };

      vi.mocked(prisma.bid.findUnique).mockResolvedValue(bid as any);
      vi.mocked(prisma.engagement.findUnique).mockResolvedValue(null);

      const tx = {
        engagement: { create: vi.fn() },
        milestone: { createMany: vi.fn() },
        bid: { update: vi.fn() }
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx as any));

      const createdEngagement = { id: 555, bidId: bid.id } as any;
      vi.mocked(tx.engagement.create).mockResolvedValue(createdEngagement);
      vi.mocked(tx.milestone.createMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(tx.bid.update).mockResolvedValue({ ...bid, status: 'ACCEPTED' } as any);

      const result = await createEngagementFromBid(bid.id, 99);

      expect(result).toEqual({ engagement: createdEngagement, created: true });
      expect(prisma.bid.findUnique).toHaveBeenCalledWith({
        where: { id: bid.id },
        include: { project: { include: { milestones: true } } }
      });
      expect(prisma.engagement.findUnique).toHaveBeenCalledWith({ where: { bidId: bid.id } });
      expect(tx.engagement.create).toHaveBeenCalledWith({
        data: {
          bidId: bid.id,
          projectId: bid.projectId,
          businessId: bid.project.businessId,
          freelancerId: bid.freelancerId,
          status: 'NEGOTIATION'
        }
      });
      expect(tx.milestone.createMany).toHaveBeenCalledWith({
        data: [
          {
            engagementId: createdEngagement.id,
            title: 'M1',
            description: 'Desc',
            amount: 1000,
            dueDate: null,
            sequenceOrder: 1,
            status: 'PENDING'
          }
        ]
      });
      expect(tx.bid.update).toHaveBeenCalledWith({ where: { id: bid.id }, data: { status: 'ACCEPTED' } });
    });

    it('returns existing engagement and does not create a new one', async () => {
      const bid = {
        id: 2,
        projectId: 11,
        freelancerId: 21,
        status: 'SUBMITTED',
        project: { businessId: 77, milestones: [] }
      };
      const existingEngagement = { id: 888, bidId: bid.id };

      vi.mocked(prisma.bid.findUnique).mockResolvedValue(bid as any);
      vi.mocked(prisma.engagement.findUnique).mockResolvedValue(existingEngagement as any);
      vi.mocked(prisma.bid.update).mockResolvedValue({ ...bid, status: 'ACCEPTED' } as any);

      const result = await createEngagementFromBid(bid.id, 77);

      expect(result).toEqual({ engagement: existingEngagement, created: false });
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.bid.update).toHaveBeenCalledWith({ where: { id: bid.id }, data: { status: 'ACCEPTED' } });
    });

    it('throws FORBIDDEN when business does not own the project', async () => {
      const bid = {
        id: 3,
        projectId: 12,
        freelancerId: 22,
        status: 'SUBMITTED',
        project: { businessId: 123, milestones: [] }
      };

      vi.mocked(prisma.bid.findUnique).mockResolvedValue(bid as any);

      await expect(createEngagementFromBid(bid.id, 999)).rejects.toThrow('FORBIDDEN');
      expect(prisma.engagement.findUnique).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('is idempotent under a unique constraint race (P2002)', async () => {
      const bid = {
        id: 4,
        projectId: 13,
        freelancerId: 23,
        status: 'SUBMITTED',
        project: { businessId: 50, milestones: [] }
      };
      const existingEngagement = { id: 999, bidId: bid.id };

      vi.mocked(prisma.bid.findUnique).mockResolvedValue(bid as any);
      vi.mocked(prisma.engagement.findUnique).mockResolvedValueOnce(null as any).mockResolvedValueOnce(existingEngagement as any);
      vi.mocked(prisma.$transaction).mockRejectedValue({ code: 'P2002' } as any);

      const result = await createEngagementFromBid(bid.id, 50);

      expect(result).toEqual({ engagement: existingEngagement, created: false });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('listEngagementsForUser', () => {
    it('returns engagements with flattened freelancer email for business role', async () => {
      const rows = [
        {
          id: 1,
          status: 'NEGOTIATION',
          paymentStatus: 'UNPAID',
          createdAt: new Date(),
          updatedAt: new Date(),
          projectId: 10,
          businessId: 99,
          freelancerId: 77,
          bidId: 555,
          project: { id: 10, title: 'Project A' },
          business: { id: 99, user: { email: 'biz@example.com' } },
          freelancer: { id: 77, user: { email: 'freelancer@example.com' } }
        }
      ];

      vi.mocked(prisma.engagement.findMany).mockResolvedValue(rows as any);

      const result = await listEngagementsForUser(99, 'BUSINESS');

      expect(prisma.engagement.findMany).toHaveBeenCalledWith({
        where: { businessId: 99 },
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, title: true } },
          business: { select: { id: true, user: { select: { email: true } } } },
          freelancer: { select: { id: true, user: { select: { email: true } } } }
        }
      });

      expect(result).toHaveLength(1);
      expect((result as any)[0].project).toEqual({ id: 10, title: 'Project A' });
      expect((result as any)[0].business).toEqual({ id: 99, email: 'biz@example.com' });
      expect((result as any)[0].freelancer).toEqual({ id: 77, email: 'freelancer@example.com' });
    });

    it('returns engagements with flattened business email for freelancer role', async () => {
      const rows = [
        {
          id: 2,
          status: 'ACTIVE',
          paymentStatus: 'UNPAID',
          createdAt: new Date(),
          updatedAt: new Date(),
          projectId: 11,
          businessId: 88,
          freelancerId: 66,
          bidId: 556,
          project: { id: 11, title: 'Project B' },
          business: { id: 88, user: { email: 'client@example.com' } },
          freelancer: { id: 66, user: { email: 'me@example.com' } }
        }
      ];

      vi.mocked(prisma.engagement.findMany).mockResolvedValue(rows as any);

      const result = await listEngagementsForUser(66, 'FREELANCER');

      expect(prisma.engagement.findMany).toHaveBeenCalledWith({
        where: { freelancerId: 66 },
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, title: true } },
          business: { select: { id: true, user: { select: { email: true } } } },
          freelancer: { select: { id: true, user: { select: { email: true } } } }
        }
      });

      expect(result).toHaveLength(1);
      expect((result as any)[0].project).toEqual({ id: 11, title: 'Project B' });
      expect((result as any)[0].business).toEqual({ id: 88, email: 'client@example.com' });
      expect((result as any)[0].freelancer).toEqual({ id: 66, email: 'me@example.com' });
    });
  });
});
