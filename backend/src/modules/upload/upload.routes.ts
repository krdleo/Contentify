import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
import { uploadFile, uploadMiddleware } from './upload.controller';

const router = Router();

router.post('/upload', requireAuth, uploadMiddleware, uploadFile);

export default router;
