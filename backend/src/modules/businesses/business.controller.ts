import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { failure, success } from '../../utils/response';
import { getBusinessPublic, getMyBusinessProfile, updateBusinessProfile } from './business.service';

export const getMeBusiness = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const profile = await getMyBusinessProfile(req.user.id);
  return success(res, profile);
};

export const updateMeBusiness = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const profile = await updateBusinessProfile(req.user.id, req.body);
  return success(res, profile);
};

export const getBusiness = async (req: AuthenticatedRequest, res: Response) => {
  const profile = await getBusinessPublic(Number(req.params.id));
  if (!profile) return failure(res, 'NOT_FOUND', 'Business not found', undefined, 404);
  return success(res, profile);
};
