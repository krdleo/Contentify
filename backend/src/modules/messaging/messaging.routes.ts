import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
import {
  createConversationHandler,
  getConversationHandler,
  listConversationsHandler,
  listMessagesHandler,
  sendMessageHandler
} from './messaging.controller';

const router = Router();

router.post('/conversations', requireAuth, createConversationHandler);
router.get('/conversations', requireAuth, listConversationsHandler);
router.get('/conversations/:id', requireAuth, getConversationHandler);
router.get('/conversations/:id/messages', requireAuth, listMessagesHandler);
router.post('/conversations/:id/messages', requireAuth, sendMessageHandler);

export default router;
