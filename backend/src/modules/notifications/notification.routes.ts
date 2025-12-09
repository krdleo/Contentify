import { Router } from 'express';
import { listNotificationsHandler, markAllNotificationsHandler, markNotificationReadHandler } from './notification.controller';
import { requireAuth } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, listNotificationsHandler);
router.post('/:id/read', requireAuth, markNotificationReadHandler);
router.post('/read-all', requireAuth, markAllNotificationsHandler);

export default router;
