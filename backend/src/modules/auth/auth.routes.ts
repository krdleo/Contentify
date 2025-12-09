import { Router } from 'express';
import { loginHandler, logoutHandler, meHandler, refreshHandler, signupHandler } from './auth.controller';
import { validateBody } from '../../middleware/validationMiddleware';
import { z } from 'zod';

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['BUSINESS', 'FREELANCER'])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/signup', validateBody(signupSchema), signupHandler);
router.post('/login', validateBody(loginSchema), loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);
router.get('/me', meHandler);

export default router;
