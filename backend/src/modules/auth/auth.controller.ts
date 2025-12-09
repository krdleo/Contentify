import { Request, Response } from 'express';
import { failure, success } from '../../utils/response';
import { login, signup } from './auth.service';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../utils/tokens';
import { prisma } from '../../config/database';

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  });
};

export const signupHandler = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const result = await signup({ email, password, role });
    setRefreshCookie(res, result.refreshToken);
    return success(res, { user: { id: result.user.id, email: result.user.email, role: result.user.role }, accessToken: result.accessToken }, 201);
  } catch (error: any) {
    if (error.message === 'EMAIL_TAKEN') {
      return failure(res, 'EMAIL_TAKEN', 'Email already registered', undefined, 409);
    }
    return failure(res, 'INTERNAL_ERROR', 'Unable to signup', undefined, 500);
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    setRefreshCookie(res, result.refreshToken);
    return success(res, { user: { id: result.user.id, email: result.user.email, role: result.user.role }, accessToken: result.accessToken });
  } catch (error: any) {
    return failure(res, 'INVALID_CREDENTIALS', 'Invalid email or password', undefined, 401);
  }
};

export const refreshHandler = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return failure(res, 'UNAUTHORIZED', 'Refresh token missing', undefined, 401);
  try {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return failure(res, 'UNAUTHORIZED', 'User not found', undefined, 401);
    const accessToken = generateAccessToken({ userId: user.id, role: user.role, isAdmin: user.isAdmin });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, isAdmin: user.isAdmin });
    setRefreshCookie(res, refreshToken);
    return success(res, { accessToken });
  } catch (error) {
    return failure(res, 'UNAUTHORIZED', 'Invalid refresh token', undefined, 401);
  }
};

export const logoutHandler = async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  return success(res, { message: 'Logged out' });
};

export const meHandler = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return failure(res, 'UNAUTHORIZED', 'Missing authorization', undefined, 401);
  const [, token] = authHeader.split(' ');
  if (!token) return failure(res, 'UNAUTHORIZED', 'Invalid authorization', undefined, 401);
  try {
    const payload = verifyAccessToken(token);
    return success(res, { userId: payload.userId, role: payload.role });
  } catch (error) {
    return failure(res, 'UNAUTHORIZED', 'Invalid token', undefined, 401);
  }
};
