import { prisma } from '../../config/database';

export const canReviewEngagement = async (engagementId: number, reviewerId: number) => {
  const engagement = await prisma.engagement.findUnique({ where: { id: engagementId } });
  if (!engagement) return null;
  if (!['COMPLETED', 'CANCELLED'].includes(engagement.status)) return null;
  if (engagement.businessId !== reviewerId && engagement.freelancerId !== reviewerId) return null;
  return engagement;
};

export const createReview = async (
  engagementId: number,
  reviewerId: number,
  revieweeId: number,
  payload: {
    ratingOverall: number;
    ratingQuality: number;
    ratingCommunication: number;
    ratingTimeliness: number;
    comment?: string;
  }
) =>
  prisma.review.create({
    data: {
      engagementId,
      reviewerId,
      revieweeId,
      ...payload
    }
  });

export const hasExistingReview = (engagementId: number, reviewerId: number) =>
  prisma.review.findFirst({ where: { engagementId, reviewerId } });

export const listReviewsForFreelancer = (freelancerUserId: number) =>
  prisma.review.findMany({ where: { revieweeId: freelancerUserId } });

export const listReviewsForBusiness = (businessUserId: number) =>
  prisma.review.findMany({ where: { revieweeId: businessUserId } });
