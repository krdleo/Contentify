import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';
import { failure } from '../utils/response';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string; isAdmin?: boolean };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return failure(res, 'UNAUTHORIZED', 'Authorization header missing', undefined, 401);
  }
  const [, token] = authHeader.split(' ');
  if (!token) {
    return failure(res, 'UNAUTHORIZED', 'Invalid authorization header', undefined, 401);
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role, isAdmin: payload.isAdmin };
    return next();
  } catch (error) {
    return failure(res, 'UNAUTHORIZED', 'Invalid or expired token', undefined, 401);
  }
};

export const requireRole = (role: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== role) {
    return failure(res, 'FORBIDDEN', 'Insufficient permissions', undefined, 403);
  }
  return next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return failure(res, 'FORBIDDEN', 'Admin access required', undefined, 403);
  }
  return next();
};
