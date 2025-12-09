import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
import { createReviewHandler, listBusinessReviewsHandler, listFreelancerReviewsHandler } from './review.controller';

const router = Router();

router.post('/engagements/:id/reviews', requireAuth, createReviewHandler);
router.get('/freelancers/:id/reviews', listFreelancerReviewsHandler);
router.get('/businesses/:id/reviews', listBusinessReviewsHandler);

export default router;
