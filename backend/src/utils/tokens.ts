import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: number;
  role: string;
  isAdmin?: boolean;
}

export const generateAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.accessTokenSecret, { expiresIn: env.accessTokenExpiresIn });

export const generateRefreshToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.refreshTokenSecret, { expiresIn: env.refreshTokenExpiresIn });

export const verifyAccessToken = (token: string) => jwt.verify(token, env.accessTokenSecret) as JwtPayload;
export const verifyRefreshToken = (token: string) => jwt.verify(token, env.refreshTokenSecret) as JwtPayload;
