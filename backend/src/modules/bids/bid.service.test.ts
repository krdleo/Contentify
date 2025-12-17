import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listMyBids } from './bid.service';
import { prisma } from '../../config/database';

vi.mock('../../config/database', () => ({
  prisma: {
    bid: {
      findMany: vi.fn(),
    },
  },
}));

describe('bid.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listMyBids', () => {
    it('includes project id and title and orders by newest first', async () => {
      const freelancerId = 42;
      const bids = [
        { id: 1, project: { id: 10, title: 'Build API' }, createdAt: new Date() },
      ];

      vi.mocked(prisma.bid.findMany).mockResolvedValue(bids as any);

      const result = await listMyBids(freelancerId);

      expect(prisma.bid.findMany).toHaveBeenCalledWith({
        where: { freelancerId },
        include: { project: { select: { id: true, title: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(bids);
    });
  });
});
