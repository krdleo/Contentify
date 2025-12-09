import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { failure, success } from '../../utils/response';
import { createBid, listMyBids, listProjectBids, updateBidStatus } from './bid.service';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { createNotification } from '../notifications/notification.service';

const bidSchema = z.object({
  bidAmount: z.number().int(),
  bidType: z.string(),
  proposedTimelineDays: z.number().int(),
  coverLetter: z.string().optional()
});

export const createBidHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const parsed = bidSchema.safeParse(req.body);
  if (!parsed.success) return failure(res, 'VALIDATION_ERROR', 'Invalid bid', undefined, 422);
  const bid = await createBid(Number(req.params.projectId), req.user.id, parsed.data);
  const project = await prisma.project.findUnique({ where: { id: Number(req.params.projectId) } });
  if (project) {
    await createNotification(project.businessId, 'BID_SUBMITTED', { projectId: project.id, bidId: bid.id });
  }
  return success(res, bid, 201);
};

export const listProjectBidsHandler = async (req: AuthenticatedRequest, res: Response) => {
  const bids = await listProjectBids(Number(req.params.projectId));
  return success(res, bids);
};

export const listMyBidsHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const bids = await listMyBids(req.user.id);
  return success(res, bids);
};

export const shortlistBidHandler = async (_req: AuthenticatedRequest, res: Response) => {
  const bid = await updateBidStatus(Number(_req.params.id), 'SHORTLISTED');
  return success(res, bid);
};

export const rejectBidHandler = async (_req: AuthenticatedRequest, res: Response) => {
  const bid = await updateBidStatus(Number(_req.params.id), 'REJECTED');
  return success(res, bid);
};
