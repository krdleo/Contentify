import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { success } from '../../utils/response';
import { prisma } from '../../config/database';
import { createAuditLog } from '../../utils/audit';

export const listUsers = async (_req: AuthenticatedRequest, res: Response) => {
  const { role, status, email } = _req.query;
  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role: String(role) } : {}),
      ...(status ? { status: String(status) } : {}),
      ...(email ? { email: { contains: String(email) } } : {})
    },
    select: { id: true, email: true, role: true, status: true, createdAt: true, isAdmin: true }
  });
  return success(res, users);
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: { id: true, email: true, role: true, status: true, createdAt: true, isAdmin: true }
  });
  return success(res, user);
};

export const suspendUser = async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data: { status: 'SUSPENDED' } });
  await createAuditLog(req.user?.id, 'SUSPEND_USER', 'User', user.id, { status: user.status });
  return success(res, { status: 'SUSPENDED' });
};

export const activateUser = async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data: { status: 'ACTIVE' } });
  await createAuditLog(req.user?.id, 'ACTIVATE_USER', 'User', user.id, { status: user.status });
  return success(res, { status: 'ACTIVE' });
};
