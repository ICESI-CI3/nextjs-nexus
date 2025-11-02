import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens, LoginCredentials, RegisterData, ApiError } from '@/src/lib/types';
import { AUTH_CONFIG } from '@/src/lib/constants';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/src/lib/utils';
import { setAuthToken, removeAuthToken } from '@/src/lib/apiClient';

/**
 * Auth Store State
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth Store Actions
 */
interface AuthActions {
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
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
      isLoading: false,
      error: null,

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
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      /**
       * Login action
       * IMPORTANT: Adjust this to match your backend API response structure
       */
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });

          // Import API client dynamically to avoid circular dependencies
          const { post } = await import('@/src/lib/apiClient');

          // TODO: Adjust endpoint and response type based on YOUR backend
          // Example response structures:
          // Option 1: { user: User, tokens: AuthTokens }
          // Option 2: { data: { user: User, tokens: AuthTokens } }
          // Option 3: { user: User, accessToken: string, refreshToken: string }
          const response = await post<{ user: User; tokens: AuthTokens }>(
            '/auth/login',
            credentials
          );

          // TODO: Adjust based on your backend response structure
          get().setUser(response.user);
          get().setTokens(response.tokens);

          set({ isLoading: false });
        } catch (error) {
          const apiError = error as ApiError;
          set({
            error: apiError.message || 'Error al iniciar sesión',
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Register action
       * IMPORTANT: Adjust this to match your backend API response structure
       */
      register: async (data) => {
        try {
          set({ isLoading: true, error: null });

          const { post } = await import('@/src/lib/apiClient');

          // TODO: Adjust endpoint and response type based on YOUR backend
          const response = await post<{ user: User; tokens: AuthTokens }>('/auth/register', data);

          // TODO: Adjust based on your backend response structure
          get().setUser(response.user);
          get().setTokens(response.tokens);

          set({ isLoading: false });
        } catch (error) {
          const apiError = error as ApiError;
          set({
            error: apiError.message || 'Error al registrarse',
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Logout action
       */
      logout: () => {
        removeAuthToken();
        removeLocalStorage(AUTH_CONFIG.USER_KEY);
        removeLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY);

        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      /**
       * Check authentication on app load
       */
      checkAuth: () => {
        const token = getLocalStorage<string | null>(AUTH_CONFIG.TOKEN_KEY, null);
        const user = getLocalStorage<User | null>(AUTH_CONFIG.USER_KEY, null);

        if (token && user) {
          set({ user, isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
