import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { failure, success } from '../../utils/response';
import { createEngagementFromBid, getEngagement, listEngagementsForUser } from './engagement.service';

export const acceptBidHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const engagement = await createEngagementFromBid(Number(req.params.id));
    return success(res, engagement, 201);
  } catch (error: any) {
    if (error.message === 'BID_NOT_FOUND') return failure(res, 'NOT_FOUND', 'Bid not found', undefined, 404);
    return failure(res, 'INTERNAL_ERROR', 'Unable to create engagement', undefined, 500);
  }
};

export const getEngagementHandler = async (req: AuthenticatedRequest, res: Response) => {
  const engagement = await getEngagement(Number(req.params.id));
  if (!engagement) return failure(res, 'NOT_FOUND', 'Engagement not found', undefined, 404);
  return success(res, engagement);
};

export const listMyEngagementsHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const engagements = await listEngagementsForUser(req.user.id, req.user.role);
  return success(res, engagements);
};
