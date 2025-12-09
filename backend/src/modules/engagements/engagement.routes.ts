import { Router } from 'express';
import {
  acceptBidHandler,
  addDeliverableHandler,
  cancelEngagementHandler,
  changeMilestoneStatusHandler,
  getEngagementHandler,
  listDeliverablesHandler,
  listMilestonesHandler,
  listMyEngagementsHandler,
  markReceivedHandler,
  setMilestonesHandler,
  setPaymentStatusHandler,
  startEngagementHandler,
  updateMilestoneHandler
} from './engagement.controller';
import { requireAuth, requireRole } from '../../middleware/authMiddleware';

const router = Router();

router.post('/bids/:id/accept', requireAuth, requireRole('BUSINESS'), acceptBidHandler);
router.get('/engagements/:id', requireAuth, getEngagementHandler);
router.get('/businesses/me/engagements', requireAuth, requireRole('BUSINESS'), listMyEngagementsHandler);
router.get('/freelancers/me/engagements', requireAuth, requireRole('FREELANCER'), listMyEngagementsHandler);
router.post('/engagements/:id/start', requireAuth, requireRole('BUSINESS'), startEngagementHandler);
router.post('/engagements/:id/cancel', requireAuth, cancelEngagementHandler);
router.post('/engagements/:id/milestones', requireAuth, setMilestonesHandler);
router.get('/engagements/:id/milestones', requireAuth, listMilestonesHandler);
router.put('/milestones/:milestoneId', requireAuth, updateMilestoneHandler);
router.post('/milestones/:milestoneId/start', requireAuth, changeMilestoneStatusHandler);
router.post('/milestones/:milestoneId/submit', requireAuth, changeMilestoneStatusHandler);
router.post('/milestones/:milestoneId/approve', requireAuth, changeMilestoneStatusHandler);
router.post('/milestones/:milestoneId/reject', requireAuth, changeMilestoneStatusHandler);
router.post('/milestones/:milestoneId/deliverables', requireAuth, addDeliverableHandler);
router.get('/milestones/:milestoneId/deliverables', requireAuth, listDeliverablesHandler);
router.post('/engagements/:id/payment-status', requireAuth, requireRole('BUSINESS'), setPaymentStatusHandler);
router.get('/engagements/:id/payment-status', requireAuth, getEngagementHandler);
router.post('/engagements/:id/mark-received', requireAuth, requireRole('FREELANCER'), markReceivedHandler);

export default router;
