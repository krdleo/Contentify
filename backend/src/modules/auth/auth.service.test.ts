import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup } from './auth.service';
import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/password';

// 1. Mock the dependencies BEFORE importing them
vi.mock('../../utils/password', () => ({
  hashPassword: vi.fn(() => Promise.resolve('hashed_password_123')),
  comparePassword: vi.fn(),
}));

vi.mock('../../utils/tokens', () => ({
  generateAccessToken: vi.fn(() => 'mock_access_token'),
  generateRefreshToken: vi.fn(() => 'mock_refresh_token'),
}));

// 2. Mock Prisma. We use a factory to avoid hoisting issues.
// We mocked findUnique and create, which are the only ones used in signup.
vi.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('AuthService - Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully signup a new BUSINESS user and send correct prisma payload', async () => {
    // Arrange: Mock that no user exists with this email
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    // Arrange: Mock the creation result
    const mockCreatedUser = {
      id: 1,
      email: 'test@business.com',
      role: 'BUSINESS',
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash: 'hashed_password_123',
    };
    vi.mocked(prisma.user.create).mockResolvedValue(mockCreatedUser as any);

    // Act
    const result = await signup({
      email: 'test@business.com',
      password: 'password123',
      role: 'BUSINESS',
    });

    // Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@business.com' } });
    expect(hashPassword).toHaveBeenCalledWith('password123');

    const createArgs = vi.mocked(prisma.user.create).mock.calls[0]?.[0] as any;
    expect(createArgs).toMatchObject({
      data: {
        email: 'test@business.com',
        passwordHash: 'hashed_password_123',
        role: 'BUSINESS',
        status: 'ACTIVE',
        businessProfile: { create: { companyName: 'New Business' } },
      },
      include: { businessProfile: true, freelancerProfile: true },
    });
    expect(createArgs.data).not.toHaveProperty('freelancerProfile');

    expect(result.user).toEqual(mockCreatedUser);
    expect(result.accessToken).toBe('mock_access_token');
    expect(result.refreshToken).toBe('mock_refresh_token');
  });

  it('should successfully signup a new FREELANCER user and send correct prisma payload', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const mockCreatedUser = {
      id: 2,
      email: 'test@freelancer.com',
      role: 'FREELANCER',
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash: 'hashed_password_123',
    };
    vi.mocked(prisma.user.create).mockResolvedValue(mockCreatedUser as any);

    const result = await signup({
      email: 'test@freelancer.com',
      password: 'password123',
      role: 'FREELANCER',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@freelancer.com' } });
    expect(hashPassword).toHaveBeenCalledWith('password123');

    const createArgs = vi.mocked(prisma.user.create).mock.calls[0]?.[0] as any;
    expect(createArgs).toMatchObject({
      data: {
        email: 'test@freelancer.com',
        passwordHash: 'hashed_password_123',
        role: 'FREELANCER',
        status: 'ACTIVE',
        freelancerProfile: { create: { displayName: 'New Freelancer' } },
      },
      include: { businessProfile: true, freelancerProfile: true },
    });
    expect(createArgs.data).not.toHaveProperty('businessProfile');

    expect(result.user).toEqual(mockCreatedUser);
    expect(result.accessToken).toBe('mock_access_token');
    expect(result.refreshToken).toBe('mock_refresh_token');
  });

  it('should throw error if email is already taken', async () => {
    // Arrange: Mock that a user DOES exist
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1, email: 'taken@test.com' } as any);

    // Act & Assert
    await expect(
      signup({
        email: 'taken@test.com',
        password: 'password123',
        role: 'FREELANCER',
      })
    ).rejects.toThrow('EMAIL_TAKEN');

    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
