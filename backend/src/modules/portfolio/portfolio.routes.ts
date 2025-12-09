import { Router } from 'express';
import { createPortfolio, deletePortfolio, listPublicPortfolio, updatePortfolio } from './portfolio.controller';
import { requireAuth, requireRole } from '../../middleware/authMiddleware';

const router = Router();

router.get('/freelancers/:id/portfolio', listPublicPortfolio);
router.post('/freelancers/me/portfolio', requireAuth, requireRole('FREELANCER'), createPortfolio);
router.put('/freelancers/me/portfolio/:itemId', requireAuth, requireRole('FREELANCER'), updatePortfolio);
router.delete('/freelancers/me/portfolio/:itemId', requireAuth, requireRole('FREELANCER'), deletePortfolio);

export default router;
