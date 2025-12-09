import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { failure, success } from '../../utils/response';
import { createPortfolioItem, deletePortfolioItem, listPortfolio, updatePortfolioItem } from './portfolio.service';

export const listPublicPortfolio = async (req: AuthenticatedRequest, res: Response) => {
  const items = await listPortfolio(Number(req.params.id));
  return success(res, items);
};

export const createPortfolio = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const item = await createPortfolioItem(req.user.id, req.body);
  return success(res, item, 201);
};

export const updatePortfolio = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const item = await updatePortfolioItem(req.user.id, Number(req.params.itemId), req.body);
  return success(res, item);
};

export const deletePortfolio = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  await deletePortfolioItem(req.user.id, Number(req.params.itemId));
  return success(res, { deleted: true });
};
