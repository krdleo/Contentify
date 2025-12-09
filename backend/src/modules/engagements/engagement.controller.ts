import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { failure, success } from '../../utils/response';
import {
  addDeliverable,
  createEngagementFromBid,
  createMilestones,
  getEngagement,
  listDeliverables,
  listEngagementsForUser,
  listMilestones,
  markFreelancerReceived,
  setMilestoneStatus,
  updateEngagementStatus,
  updateMilestone,
  updatePaymentStatus
} from './engagement.service';
import { z } from 'zod';

const milestoneSchema = z.array(
  z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    amount: z.number().int(),
    dueDate: z.string().datetime().optional(),
    sequenceOrder: z.number().int()
  })
);

const paymentSchema = z.object({ paymentStatus: z.string(), paymentNotes: z.string().optional() });
const deliverableSchema = z.object({ fileUrl: z.string().url(), notes: z.string().optional() });

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

export const startEngagementHandler = async (req: AuthenticatedRequest, res: Response) => {
  const engagement = await updateEngagementStatus(Number(req.params.id), 'ACTIVE');
  return success(res, engagement);
};

export const cancelEngagementHandler = async (req: AuthenticatedRequest, res: Response) => {
  const engagement = await updateEngagementStatus(Number(req.params.id), 'CANCELLED');
  return success(res, engagement);
};

export const setMilestonesHandler = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = milestoneSchema.safeParse(req.body);
  if (!parsed.success) return failure(res, 'VALIDATION_ERROR', 'Invalid milestone data', undefined, 422);
  await createMilestones(
    Number(req.params.id),
    parsed.data.map((m) => ({ ...m, dueDate: m.dueDate ? new Date(m.dueDate) : null }))
  );
  const milestones = await listMilestones(Number(req.params.id));
  return success(res, milestones, 201);
};

export const listMilestonesHandler = async (req: AuthenticatedRequest, res: Response) => {
  const milestones = await listMilestones(Number(req.params.id));
  return success(res, milestones);
};

export const updateMilestoneHandler = async (req: AuthenticatedRequest, res: Response) => {
  const milestoneId = Number(req.params.milestoneId);
  const data: any = req.body;
  const milestone = await updateMilestone(milestoneId, {
    title: data.title,
    description: data.description,
    amount: data.amount,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined
  });
  return success(res, milestone);
};

export const changeMilestoneStatusHandler = async (req: AuthenticatedRequest, res: Response) => {
  const milestone = await setMilestoneStatus(Number(req.params.milestoneId), String(req.body.status));
  return success(res, milestone);
};

export const addDeliverableHandler = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = deliverableSchema.safeParse(req.body);
  if (!parsed.success) return failure(res, 'VALIDATION_ERROR', 'Invalid deliverable data', undefined, 422);
  const deliverable = await addDeliverable(Number(req.params.milestoneId), parsed.data.fileUrl, parsed.data.notes);
  return success(res, deliverable, 201);
};

export const listDeliverablesHandler = async (req: AuthenticatedRequest, res: Response) => {
  const deliverables = await listDeliverables(Number(req.params.milestoneId));
  return success(res, deliverables);
};

export const setPaymentStatusHandler = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) return failure(res, 'VALIDATION_ERROR', 'Invalid payment data', undefined, 422);
  const engagement = await updatePaymentStatus(Number(req.params.id), parsed.data.paymentStatus, parsed.data.paymentNotes);
  return success(res, engagement);
};

export const markReceivedHandler = async (req: AuthenticatedRequest, res: Response) => {
  const engagement = await markFreelancerReceived(Number(req.params.id));
  return success(res, engagement);
};
