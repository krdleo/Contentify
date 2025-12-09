import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken } from '../../utils/tokens';
import { SignupPayload } from './auth.types';

export const signup = async (payload: SignupPayload) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new Error('EMAIL_TAKEN');
  }
  const passwordHash = await hashPassword(payload.password);
  const user = await prisma.user.create({
    data: {
      email: payload.email,
      passwordHash,
      role: payload.role,
      status: 'ACTIVE',
      ...(payload.role === 'BUSINESS'
        ? { businessProfile: { create: { companyName: 'New Business' } } }
        : { freelancerProfile: { create: { displayName: 'New Freelancer' } } })
    },
    include: { businessProfile: true, freelancerProfile: true }
  });
  const accessToken = generateAccessToken({ userId: user.id, role: user.role, isAdmin: user.isAdmin });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, isAdmin: user.isAdmin });
  return { user, accessToken, refreshToken };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('INVALID_CREDENTIALS');
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');
  const accessToken = generateAccessToken({ userId: user.id, role: user.role, isAdmin: user.isAdmin });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, isAdmin: user.isAdmin });
  return { user, accessToken, refreshToken };
};
