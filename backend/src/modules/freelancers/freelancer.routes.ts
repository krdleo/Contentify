import { Router } from 'express';
import { getFreelancer, getMeFreelancer, listFreelancersHandler, updateMeFreelancer } from './freelancer.controller';
import { requireAuth, requireRole } from '../../middleware/authMiddleware';

const router = Router();

router.get('/me', requireAuth, requireRole('FREELANCER'), getMeFreelancer);
router.put('/me', requireAuth, requireRole('FREELANCER'), updateMeFreelancer);
router.get('/:id', getFreelancer);
router.get('/', listFreelancersHandler);

export default router;
