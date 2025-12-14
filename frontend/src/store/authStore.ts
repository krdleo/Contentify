import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { setAccessToken } from '../api/axios';

export type UserRole = 'BUSINESS' | 'FREELANCER';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  status: string;
  businessProfile?: any;
  freelancerProfile?: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { accessToken, user } = response.data.data;
          setAccessToken(accessToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.message || 'Login failed';
          throw new Error(errorMessage);
        }
      },

      signup: async (email: string, password: string, role: UserRole) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/signup', { email, password, role });
          const { accessToken, user } = response.data.data;
          setAccessToken(accessToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.message || 'Signup failed';
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          setAccessToken(null);
          set({ user: null, isAuthenticated: false });
        }
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/auth/me');
          const user = response.data.data;
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

