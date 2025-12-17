import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('morgan', () => ({
  default: () => (_req: any, _res: any, next: any) => next()
}));

vi.mock('../config/env', () => ({
  env: {
    port: 4000,
    databaseUrl: 'mock://db',
    accessTokenSecret: 'test',
    refreshTokenSecret: 'test',
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
    corsOrigin: '*',
    nodeEnv: 'test'
  }
}));

vi.mock('../config/database', () => ({
  prisma: {
    bid: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    engagement: {
      findUnique: vi.fn(),
      create: vi.fn()
    },
    milestone: {
      createMany: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

vi.mock('../utils/tokens', () => ({
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  verifyAccessToken: vi.fn(),
  verifyRefreshToken: vi.fn()
}));

vi.mock('../utils/password', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn()
}));

vi.mock('../utils/cloudinary', () => ({
  uploadToCloudinary: vi.fn()
}));

import app from '../app';
import { prisma } from '../config/database';
import { verifyAccessToken } from '../utils/tokens';

describe('POST /api/v1/bids/:id/accept', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(verifyAccessToken).mockReturnValue({ userId: 1, role: 'BUSINESS', isAdmin: false } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(prisma as any));
  });

  it('creates an engagement for the owning business (201)', async () => {
    const bid = {
      id: 123,
      projectId: 10,
      freelancerId: 20,
      status: 'SUBMITTED',
      project: { businessId: 1, milestones: [] }
    };
    const engagement = { id: 999, bidId: bid.id };

    vi.mocked(prisma.bid.findUnique).mockResolvedValue(bid as any);
    vi.mocked(prisma.engagement.findUnique).mockResolvedValue(null as any);
    vi.mocked(prisma.engagement.create).mockResolvedValue(engagement as any);
    vi.mocked(prisma.milestone.createMany).mockResolvedValue({ count: 0 } as any);
    vi.mocked(prisma.bid.update).mockResolvedValue({ ...bid, status: 'ACCEPTED' } as any);

    const res = await request(app)
      .post('/api/v1/bids/123/accept')
      .set('Authorization', 'Bearer token')
      .send();

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(engagement);
  });

  it('is idempotent when accepting the same bid twice (201 then 200)', async () => {
    const bidSubmitted = {
      id: 124,
      projectId: 11,
      freelancerId: 21,
      status: 'SUBMITTED',
      project: { businessId: 1, milestones: [] }
    };
    const bidAccepted = { ...bidSubmitted, status: 'ACCEPTED' };
    const engagement = { id: 1000, bidId: bidSubmitted.id };

    vi.mocked(prisma.bid.findUnique).mockResolvedValueOnce(bidSubmitted as any).mockResolvedValueOnce(bidAccepted as any);
    vi.mocked(prisma.engagement.findUnique).mockResolvedValueOnce(null as any).mockResolvedValueOnce(engagement as any);
    vi.mocked(prisma.engagement.create).mockResolvedValue(engagement as any);
    vi.mocked(prisma.milestone.createMany).mockResolvedValue({ count: 0 } as any);
    vi.mocked(prisma.bid.update).mockResolvedValue({ ...bidSubmitted, status: 'ACCEPTED' } as any);

    const first = await request(app)
      .post('/api/v1/bids/124/accept')
      .set('Authorization', 'Bearer token')
      .send();
    const second = await request(app)
      .post('/api/v1/bids/124/accept')
      .set('Authorization', 'Bearer token')
      .send();

    expect(first.status).toBe(201);
    expect(first.body.success).toBe(true);
    expect(first.body.data).toEqual(engagement);

    expect(second.status).toBe(200);
    expect(second.body.success).toBe(true);
    expect(second.body.data).toEqual(engagement);
  });

  it('rejects acceptance by a different business (403)', async () => {
    vi.mocked(verifyAccessToken).mockReturnValue({ userId: 2, role: 'BUSINESS', isAdmin: false } as any);

    const bid = {
      id: 125,
      projectId: 12,
      freelancerId: 22,
      status: 'SUBMITTED',
      project: { businessId: 1, milestones: [] }
    };

    vi.mocked(prisma.bid.findUnique).mockResolvedValue(bid as any);

    const res = await request(app)
      .post('/api/v1/bids/125/accept')
      .set('Authorization', 'Bearer token')
      .send();

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

