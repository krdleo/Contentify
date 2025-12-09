import { Router } from 'express';
import { acceptBidHandler, getEngagementHandler, listMyEngagementsHandler } from './engagement.controller';
import { requireAuth, requireRole } from '../../middleware/authMiddleware';

const router = Router();

router.post('/bids/:id/accept', requireAuth, requireRole('BUSINESS'), acceptBidHandler);
router.get('/engagements/:id', requireAuth, getEngagementHandler);
router.get('/businesses/me/engagements', requireAuth, requireRole('BUSINESS'), listMyEngagementsHandler);
router.get('/freelancers/me/engagements', requireAuth, requireRole('FREELANCER'), listMyEngagementsHandler);

export default router;
