import { Router } from 'express';
import { createBidHandler, listMyBidsHandler, listProjectBidsHandler, rejectBidHandler, shortlistBidHandler } from './bid.controller';
import { createBidHandler, listMyBidsHandler, listProjectBidsHandler } from './bid.controller';
import { requireAuth, requireRole } from '../../middleware/authMiddleware';

const router = Router();

router.post('/projects/:projectId/bids', requireAuth, requireRole('FREELANCER'), createBidHandler);
router.get('/projects/:projectId/bids', requireAuth, requireRole('BUSINESS'), listProjectBidsHandler);
router.get('/freelancers/me/bids', requireAuth, requireRole('FREELANCER'), listMyBidsHandler);
router.post('/bids/:id/shortlist', requireAuth, requireRole('BUSINESS'), shortlistBidHandler);
router.post('/bids/:id/reject', requireAuth, requireRole('BUSINESS'), rejectBidHandler);

export default router;
