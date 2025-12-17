import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Login } from './Login';

const navigate = vi.hoisted(() => vi.fn());
const authState = vi.hoisted(() => ({ user: null as null | { role: 'BUSINESS' | 'FREELANCER' } }));
const loginMock = vi.hoisted(() => vi.fn(async () => {}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

vi.mock('../store/authStore', () => ({
  useAuthStore: Object.assign(
    () => ({ login: loginMock, isLoading: false }),
    { getState: () => authState }
  ),
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;
  });

  it('submits login and navigates to business dashboard for BUSINESS role', async () => {
    loginMock.mockImplementation(async () => {
      authState.user = { role: 'BUSINESS' };
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email address/i), 'test@business.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('test@business.com', 'password123');
    });

    expect(navigate).toHaveBeenCalledWith('/business/dashboard');
  });

  it('shows a human-readable error message when login throws', async () => {
    loginMock.mockImplementation(async () => {
      throw new Error('Invalid credentials');
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email address/i), 'bad@test.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
});
