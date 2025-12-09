import { Router } from 'express';
import { activateUser, getUser, listUsers, suspendUser } from './admin.controller';
import { requireAdmin, requireAuth } from '../../middleware/authMiddleware';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.post('/users/:id/suspend', suspendUser);
router.post('/users/:id/activate', activateUser);

export default router;
