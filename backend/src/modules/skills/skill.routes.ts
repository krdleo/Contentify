import { Router } from 'express';
import { listSkillsHandler, updateFreelancerSkillsHandler } from './skill.controller';
import { requireAuth, requireRole } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', listSkillsHandler);
router.put('/freelancers/me/skills', requireAuth, requireRole('FREELANCER'), updateFreelancerSkillsHandler);

export default router;
