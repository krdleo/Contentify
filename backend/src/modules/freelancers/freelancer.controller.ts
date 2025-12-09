import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { failure, success } from '../../utils/response';
import { getFreelancerPublic, getMyFreelancerProfile, listFreelancers, updateFreelancerProfile } from './freelancer.service';

export const getMeFreelancer = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const profile = await getMyFreelancerProfile(req.user.id);
  return success(res, profile);
};

export const updateMeFreelancer = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const profile = await updateFreelancerProfile(req.user.id, req.body);
  return success(res, profile);
};

export const getFreelancer = async (req: AuthenticatedRequest, res: Response) => {
  const profile = await getFreelancerPublic(Number(req.params.id));
  if (!profile) return failure(res, 'NOT_FOUND', 'Freelancer not found', undefined, 404);
  return success(res, profile);
};

export const listFreelancersHandler = async (req: AuthenticatedRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const { items, total } = await listFreelancers({
    category: req.query.category as string | undefined,
    city: req.query.city as string | undefined,
    page,
    pageSize
  });
  return success(res, { items, page, pageSize, total });
};
