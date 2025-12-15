import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import businessRoutes from './modules/businesses/business.routes';
import freelancerRoutes from './modules/freelancers/freelancer.routes';
import skillRoutes from './modules/skills/skill.routes';
import portfolioRoutes from './modules/portfolio/portfolio.routes';
import projectRoutes from './modules/projects/project.routes';
import bidRoutes from './modules/bids/bid.routes';
import engagementRoutes from './modules/engagements/engagement.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import adminRoutes from './modules/admin/admin.routes';
import uploadRoutes from './modules/upload/upload.routes';

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/v1/auth', authLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/businesses', businessRoutes);
app.use('/api/v1/freelancers', freelancerRoutes);
app.use('/api/v1/skills', skillRoutes);
app.use('/api/v1', portfolioRoutes);
app.use('/api/v1', projectRoutes);
app.use('/api/v1', bidRoutes);
app.use('/api/v1', engagementRoutes);
app.use('/api/v1', uploadRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);

export default app;
