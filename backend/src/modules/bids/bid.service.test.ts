import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../../config/database';
import { getBidsByProject, placeBid } from './bid.service';

vi.mock('../../config/database', () => ({
  prisma: {
    bid: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('bid.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('placeBid forwards payload to prisma.bid.create', async () => {
    const payload = { bidAmount: 500, bidType: 'FIXED', proposedTimelineDays: 30, coverLetter: 'Hi' };
    const createdBid = { id: 7, projectId: 3, freelancerId: 9, ...payload };
    vi.mocked(prisma.bid.create).mockResolvedValue(createdBid as any);

    const result = await placeBid(3, 9, payload);

    expect(prisma.bid.create).toHaveBeenCalledWith({
      data: { ...payload, projectId: 3, freelancerId: 9 },
    });
    expect(result).toEqual(createdBid);
  });

  it('getBidsByProject retrieves bids ordered by createdAt desc', async () => {
    const bids = [{ id: 1 }, { id: 2 }];
    vi.mocked(prisma.bid.findMany).mockResolvedValue(bids as any);

    const result = await getBidsByProject(12);

    expect(prisma.bid.findMany).toHaveBeenCalledWith({
      where: { projectId: 12 },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual(bids);
  });
});
