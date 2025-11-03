import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, ApiError } from '@/src/lib/types';
import { AUTH_CONFIG } from '@/src/lib/constants';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/src/lib/utils';
import { setAuthToken, removeAuthToken } from '@/src/lib/apiClient';
import authService, { type LoginResult } from '@/src/services/authService';

/**
 * Auth Store State
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // 2FA status cached client-side; null means unknown (not yet fetched/derived)
  twoFactorEnabled: boolean | null;
}

/**
 * Auth Store Actions
 */
interface AuthActions {
  setUser: (user: User | null) => void;
  setTokens: (tokens: { accessToken: string; refreshToken?: string }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTwoFactorEnabled: (enabled: boolean | null) => void;
  login: (payload: { email: string; password: string }) => Promise<LoginResult>;
  register: () => Promise<never>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * IMPORTANT: This is a base authentication store.
 * Adjust the login/register functions to match YOUR NestJS backend API endpoints and response structure.
 *
 * Example adjustments:
 * - Change endpoint paths ('/auth/login', '/auth/register')
 * - Modify response type based on your backend (e.g., response.data.user or just response.user)
 * - Add/remove fields from RegisterData based on your backend requirements
 * - Handle additional auth states (e.g., email verification, 2FA)
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      twoFactorEnabled: null,

      // Actions
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        if (user) {
          setLocalStorage(AUTH_CONFIG.USER_KEY, user);
        } else {
          removeLocalStorage(AUTH_CONFIG.USER_KEY);
        }
      },

      setTokens: (tokens) => {
        setAuthToken(tokens.accessToken);
        if (tokens.refreshToken) {
          setLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY, tokens.refreshToken);
        }
        set({ isAuthenticated: true });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setTwoFactorEnabled: (enabled) => set({ twoFactorEnabled: enabled }),

      /**
       * Login action (adapted to backend that may require 2FA)
       */
      login: async ({ email, password }) => {
        try {
          set({ isLoading: true, error: null });
          const result = await authService.login(email, password);

          if ('requires2FA' in result && result.requires2FA) {
            set({ isLoading: false });
            return result;
          }

          // Persist and mark authenticated
          get().setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
          set({ isLoading: false });
          return result;
        } catch (error) {
          const apiError = error as ApiError;
          set({ error: apiError.message || 'Error al iniciar sesión', isLoading: false });
          throw error;
        }
      },

      // Placeholder: implement register when backend contract is defined
      register: async () => {
        throw new Error('Not implemented');
      },

      /**
       * Logout action
       */
      logout: async () => {
        try {
          set({ isLoading: true });
          await authService.logout();
        } finally {
          removeAuthToken();
          removeLocalStorage(AUTH_CONFIG.USER_KEY);
          removeLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY);

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            twoFactorEnabled: null,
          });

          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },

      /**
       * Check authentication on app load
       */
      checkAuth: () => {
        set({ isLoading: true });
        const token = getLocalStorage<string | null>(AUTH_CONFIG.TOKEN_KEY, null);
        if (token) {
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      /**
       * Fetch user profile from backend and update store
       */
      fetchProfile: async () => {
        try {
          set({ isLoading: true });
          const profile = await authService.getProfile();
          get().setUser(profile);
          set({ isLoading: false });
        } catch (error) {
          const apiError = error as ApiError;
          set({ error: apiError.message || 'Error al cargar perfil', isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        twoFactorEnabled: state.twoFactorEnabled,
      }),
    }
  )
);
