import { Response } from 'express';

export const success = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });

export const failure = (
  res: Response,
  code: string,
  message: string,
  details?: Record<string, string>,
  status = 400
) => res.status(status).json({ success: false, error: { code, message, details } });
