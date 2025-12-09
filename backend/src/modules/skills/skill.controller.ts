import { Request, Response } from 'express';
import { failure, success } from '../../utils/response';
import { listSkills, replaceFreelancerSkills } from './skill.service';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

export const listSkillsHandler = async (_req: Request, res: Response) => {
  const skills = await listSkills();
  return success(res, skills);
};

export const updateFreelancerSkillsHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const { skillIds } = req.body as { skillIds: number[] };
  await replaceFreelancerSkills(req.user.id, skillIds);
  return success(res, { updated: true });
};
