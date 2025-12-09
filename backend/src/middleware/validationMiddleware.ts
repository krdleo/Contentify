import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { failure } from '../utils/response';

export const validateBody = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      if (err.path.length) {
        details[err.path.join('.')] = err.message;
      }
    });
    return failure(res, 'VALIDATION_ERROR', 'Invalid request body', details, 422);
  }
  req.body = result.data;
  return next();
};
