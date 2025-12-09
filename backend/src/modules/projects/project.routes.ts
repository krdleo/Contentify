import { Router } from 'express';
import { createProjectHandler, getProjectHandler, listMyProjectsHandler, listProjectsHandler } from './project.controller';
import { requireAuth, requireRole } from '../../middleware/authMiddleware';

const router = Router();

router.post('/projects', requireAuth, requireRole('BUSINESS'), createProjectHandler);
router.get('/projects', listProjectsHandler);
router.get('/projects/:id', getProjectHandler);
router.get('/businesses/me/projects', requireAuth, requireRole('BUSINESS'), listMyProjectsHandler);

export default router;
