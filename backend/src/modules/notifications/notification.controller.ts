import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { failure, success } from '../../utils/response';
import { listNotifications, markAllRead, markNotificationRead } from './notification.service';

export const listNotificationsHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const items = await listNotifications(req.user.id);
  return success(res, items);
};

export const markNotificationReadHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  await markNotificationRead(req.user.id, Number(req.params.id));
  return success(res, { marked: true });
};

export const markAllNotificationsHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  await markAllRead(req.user.id);
  return success(res, { marked: true });
};
