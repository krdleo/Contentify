import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { success } from '../../utils/response';
import { prisma } from '../../config/database';

export const listUsers = async (_req: AuthenticatedRequest, res: Response) => {
  const users = await prisma.user.findMany();
  return success(res, users);
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  return success(res, user);
};

export const suspendUser = async (req: AuthenticatedRequest, res: Response) => {
  await prisma.user.update({ where: { id: Number(req.params.id) }, data: { status: 'SUSPENDED' } });
  return success(res, { status: 'SUSPENDED' });
};

export const activateUser = async (req: AuthenticatedRequest, res: Response) => {
  await prisma.user.update({ where: { id: Number(req.params.id) }, data: { status: 'ACTIVE' } });
  return success(res, { status: 'ACTIVE' });
};
