import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('morgan', () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
}));

vi.mock('../config/env', () => ({
  env: {
    port: 4000,
    databaseUrl: 'mock://db',
    accessTokenSecret: 'test',
    refreshTokenSecret: 'test',
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
    corsOrigin: '*',
    nodeEnv: 'test',
  },
}));

vi.mock('../config/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('../utils/password', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

vi.mock('../utils/tokens', () => ({
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  verifyAccessToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
}));

vi.mock('../utils/cloudinary', () => ({
  uploadToCloudinary: vi.fn(),
}));

import app from '../app';
import { prisma } from '../config/database';
import { comparePassword, hashPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/tokens';

describe('Auth routes (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/signup', () => {
    it('returns 201 on success and sets refresh cookie', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(hashPassword).mockResolvedValue('hashed' as any);
      vi.mocked(prisma.user.create).mockResolvedValue(
        { id: 1, email: 'test@business.com', role: 'BUSINESS', isAdmin: false } as any
      );
      vi.mocked(generateAccessToken).mockReturnValue('access_token');
      vi.mocked(generateRefreshToken).mockReturnValue('refresh_token');

      const res = await request(app).post('/api/v1/auth/signup').send({
        email: 'test@business.com',
        password: 'password123',
        role: 'BUSINESS',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('access_token');
      expect(res.body.data.user).toEqual({ id: 1, email: 'test@business.com', role: 'BUSINESS' });
      expect(res.headers['set-cookie']?.join(';')).toMatch(/refreshToken=/);
    });

    it('returns 422 on validation error', async () => {
      const res = await request(app).post('/api/v1/auth/signup').send({
        email: 'not-an-email',
        password: 'short',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 409 EMAIL_TAKEN when email already exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1 } as any);

      const res = await request(app).post('/api/v1/auth/signup').send({
        email: 'taken@test.com',
        password: 'password123',
        role: 'FREELANCER',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_TAKEN');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 200 on success and sets refresh cookie', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        { id: 2, email: 'login@test.com', role: 'FREELANCER', isAdmin: false, passwordHash: 'hashed' } as any
      );
      vi.mocked(comparePassword).mockResolvedValue(true as any);
      vi.mocked(generateAccessToken).mockReturnValue('access_login');
      vi.mocked(generateRefreshToken).mockReturnValue('refresh_login');

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'login@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('access_login');
      expect(res.headers['set-cookie']?.join(';')).toMatch(/refreshToken=/);
    });

    it('returns 401 on invalid credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'missing@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('returns 401 when refresh cookie is missing', async () => {
      const res = await request(app).post('/api/v1/auth/refresh');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 when refresh token is invalid', async () => {
      vi.mocked(verifyRefreshToken).mockImplementation(() => {
        throw new Error('bad_refresh');
      });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refreshToken=invalid_token']);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 when refresh token is valid but user not found', async () => {
      vi.mocked(verifyRefreshToken).mockReturnValue({ userId: 999, role: 'BUSINESS', isAdmin: false } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refreshToken=valid_but_missing_user']);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns accessToken and resets refresh cookie on success', async () => {
      vi.mocked(verifyRefreshToken).mockReturnValue({ userId: 10, role: 'FREELANCER', isAdmin: false } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 10, role: 'FREELANCER', isAdmin: false } as any);
      vi.mocked(generateAccessToken).mockReturnValue('access_refreshed');
      vi.mocked(generateRefreshToken).mockReturnValue('refresh_refreshed');

      const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', ['refreshToken=valid']);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('access_refreshed');
      expect(res.headers['set-cookie']?.join(';')).toMatch(/refreshToken=/);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 when token is invalid', async () => {
      vi.mocked(verifyAccessToken).mockImplementation(() => {
        throw new Error('bad_access');
      });

      const res = await request(app).get('/api/v1/auth/me').set('Authorization', 'Bearer invalid');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns userId and role when token is valid', async () => {
      vi.mocked(verifyAccessToken).mockReturnValue({ userId: 123, role: 'BUSINESS', isAdmin: false } as any);

      const res = await request(app).get('/api/v1/auth/me').set('Authorization', 'Bearer valid');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({ userId: 123, role: 'BUSINESS' });
    });
  });
});
