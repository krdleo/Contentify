import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { failure, success } from '../../utils/response';
import { canReviewEngagement, createReview, hasExistingReview, listReviewsForBusiness, listReviewsForFreelancer } from './review.service';

const reviewSchema = z.object({
  ratingOverall: z.number().min(1).max(5),
  ratingQuality: z.number().min(1).max(5),
  ratingCommunication: z.number().min(1).max(5),
  ratingTimeliness: z.number().min(1).max(5),
  comment: z.string().optional()
});

export const createReviewHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return failure(res, 'VALIDATION_ERROR', 'Invalid request body', undefined, 422);
  const engagementId = Number(req.params.id);
  const engagement = await canReviewEngagement(engagementId, req.user.id);
  if (!engagement) return failure(res, 'FORBIDDEN', 'Cannot review this engagement', undefined, 403);
  const already = await hasExistingReview(engagementId, req.user.id);
  if (already) return failure(res, 'CONFLICT', 'Review already submitted', undefined, 409);
  const revieweeId = engagement.businessId === req.user.id ? engagement.freelancerId : engagement.businessId;
  const review = await createReview(engagementId, req.user.id, revieweeId, parsed.data);
  return success(res, review, 201);
};

export const listFreelancerReviewsHandler = async (_req: AuthenticatedRequest, res: Response) => {
  const reviews = await listReviewsForFreelancer(Number(res.locals?.params?.id) || Number(_req.params.id));
  return success(res, reviews);
};

export const listBusinessReviewsHandler = async (_req: AuthenticatedRequest, res: Response) => {
  const reviews = await listReviewsForBusiness(Number(res.locals?.params?.id) || Number(_req.params.id));
  return success(res, reviews);
};
