import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { failure, success } from '../../utils/response';
import { createBid, listMyBids, listProjectBids } from './bid.service';

export const createBidHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const bid = await createBid(Number(req.params.projectId), req.user.id, req.body);
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
