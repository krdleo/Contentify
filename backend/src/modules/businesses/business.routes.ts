import { Router } from 'express';
import { getBusiness, getMeBusiness, updateMeBusiness } from './business.controller';
import { requireAuth, requireRole } from '../../middleware/authMiddleware';

const router = Router();

router.get('/me', requireAuth, requireRole('BUSINESS'), getMeBusiness);
router.put('/me', requireAuth, requireRole('BUSINESS'), updateMeBusiness);
router.get('/:id', getBusiness);

export default router;
