import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { failure, success } from '../../utils/response';
import { addDisputeAttachment, createDispute, getDispute, listAdminDisputes, listMyDisputes, resolveDispute } from './dispute.service';

const disputeSchema = z.object({
  reasonCode: z.string().min(2),
  description: z.string().min(5)
});

const attachmentSchema = z.object({ fileUrl: z.string().url(), description: z.string().optional() });
const resolveSchema = z.object({ status: z.string(), resolutionNotes: z.string().optional() });

export const createDisputeHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const parsed = disputeSchema.safeParse(req.body);
  if (!parsed.success) return failure(res, 'VALIDATION_ERROR', 'Invalid request body', undefined, 422);
  const dispute = await createDispute(Number(req.params.id), req.user.id, parsed.data.reasonCode, parsed.data.description);
  return success(res, dispute, 201);
};

export const listMyDisputesHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const disputes = await listMyDisputes(req.user.id);
  return success(res, disputes);
};

export const getDisputeHandler = async (req: AuthenticatedRequest, res: Response) => {
  const dispute = await getDispute(Number(req.params.id));
  if (!dispute) return failure(res, 'NOT_FOUND', 'Dispute not found', undefined, 404);
  return success(res, dispute);
};

export const addDisputeAttachmentHandler = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = attachmentSchema.safeParse(req.body);
  if (!parsed.success) return failure(res, 'VALIDATION_ERROR', 'Invalid request body', undefined, 422);
  const attachment = await addDisputeAttachment(Number(req.params.id), parsed.data.fileUrl, parsed.data.description);
  return success(res, attachment, 201);
};

export const adminListDisputesHandler = async (_req: AuthenticatedRequest, res: Response) => {
  const disputes = await listAdminDisputes();
  return success(res, disputes);
};

export const adminResolveDisputeHandler = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = resolveSchema.safeParse(req.body);
  if (!parsed.success) return failure(res, 'VALIDATION_ERROR', 'Invalid request body', undefined, 422);
  const dispute = await resolveDispute(Number(req.params.id), parsed.data.status, parsed.data.resolutionNotes);
  return success(res, dispute);
};
