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

export const shortlistBidHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  try {
    const bid = await updateBidStatus(Number(req.params.id), 'SHORTLISTED', req.user.id);
    return success(res, bid);
  } catch (error: any) {
    if (error?.message === 'FORBIDDEN') return failure(res, 'FORBIDDEN', 'Not authorized', undefined, 403);
    if (error?.message === 'BID_NOT_FOUND') return failure(res, 'NOT_FOUND', 'Bid not found', undefined, 404);
    return failure(res, 'INTERNAL_ERROR', 'Unable to update bid', undefined, 500);
  }
};

export const rejectBidHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  try {
    const bid = await updateBidStatus(Number(req.params.id), 'REJECTED', req.user.id);
    return success(res, bid);
  } catch (error: any) {
    if (error?.message === 'FORBIDDEN') return failure(res, 'FORBIDDEN', 'Not authorized', undefined, 403);
    if (error?.message === 'BID_NOT_FOUND') return failure(res, 'NOT_FOUND', 'Bid not found', undefined, 404);
    return failure(res, 'INTERNAL_ERROR', 'Unable to update bid', undefined, 500);
  }
};
