import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { failure } from '../utils/response';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.message);
  return failure(res, 'INTERNAL_ERROR', 'An unexpected error occurred', undefined, 500);
};
