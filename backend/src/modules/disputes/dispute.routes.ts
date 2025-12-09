import { Router } from 'express';
import { requireAdmin, requireAuth } from '../../middleware/authMiddleware';
import {
  addDisputeAttachmentHandler,
  adminListDisputesHandler,
  adminResolveDisputeHandler,
  createDisputeHandler,
  getDisputeHandler,
  listMyDisputesHandler
} from './dispute.controller';

const router = Router();

router.post('/engagements/:id/disputes', requireAuth, createDisputeHandler);
router.get('/disputes/:id', requireAuth, getDisputeHandler);
router.get('/my/disputes', requireAuth, listMyDisputesHandler);
router.post('/disputes/:id/attachments', requireAuth, addDisputeAttachmentHandler);

router.get('/admin/disputes', requireAuth, requireAdmin, adminListDisputesHandler);
router.post('/admin/disputes/:id/resolve', requireAuth, requireAdmin, adminResolveDisputeHandler);

export default router;
