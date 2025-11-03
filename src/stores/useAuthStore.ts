import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, ApiError } from '@/src/lib/types';
import { AUTH_CONFIG, ROUTES } from '@/src/lib/constants'; // ← ADDED ROUTES
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/src/lib/utils';
import { setAuthToken, removeAuthToken } from '@/src/lib/apiClient';
import authService, { type LoginResult } from '@/src/services/authService';

// ============================================
// STATE & ACTIONS INTERFACE
// ============================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  twoFactorEnabled: boolean | null; // null = unknown, not yet fetched
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setTokens: (tokens: { accessToken: string; refreshToken?: string }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTwoFactorEnabled: (enabled: boolean | null) => void;
  login: (payload: { email: string; password: string }) => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// ============================================
// ZUSTAND STORE
// ============================================

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ========== INITIAL STATE ==========
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      twoFactorEnabled: null,

      // ========== ACTIONS ==========

      /**
       * Set user and sync with localStorage
       */
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          twoFactorEnabled: user?.twoFactorEnabled ?? null,
        });

        if (user) {
          setLocalStorage(AUTH_CONFIG.USER_KEY, user);
        } else {
          removeLocalStorage(AUTH_CONFIG.USER_KEY);
        }
      },

      /**
       * Set JWT tokens in both apiClient and localStorage
       */
      setTokens: (tokens) => {
        setAuthToken(tokens.accessToken);

        if (tokens.refreshToken) {
          setLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY, tokens.refreshToken);
        }

        set({ isAuthenticated: true });
      },

      /**
       * Set loading state
       */
      setLoading: (loading) => set({ isLoading: loading }),

      /**
       * Set error message
       */
      setError: (error) => set({ error }),

      /**
       * Set 2FA enabled status
       */
      setTwoFactorEnabled: (enabled) => set({ twoFactorEnabled: enabled }),

      /**
       * Login with email and password
       * Returns LoginResult (may require 2FA)
       */
      login: async ({ email, password }) => {
        try {
          set({ isLoading: true, error: null });

          const result = await authService.login(email, password);

          // If 2FA is required, don't set tokens yet
          if ('requires2FA' in result && result.requires2FA) {
            set({ isLoading: false });
            return result;
          }

          // No 2FA required - set tokens and mark authenticated
          get().setTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });

          set({ isLoading: false });
          return result;
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
       * Logout - clear tokens and reset state
       */
      logout: async () => {
        try {
          set({ isLoading: true });
          await authService.logout();
        } catch (error) {
          // Log error but continue with cleanup
          console.error('Logout error:', error);
        } finally {
          // Always clear local data even if API call fails
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

          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = ROUTES.LOGIN;
          }
        }
      },

      /**
       * Check if user is authenticated on app load
       * Does NOT fetch profile, just checks for token presence
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
       * Fetch user profile from backend
       * Updates user object and 2FA status
       */
      fetchProfile: async () => {
        try {
          set({ isLoading: true });

          const profile = await authService.getProfile();

          get().setUser(profile);
        } catch (error) {
          const apiError = error as ApiError;
          set({
            error: apiError.message || 'Error al cargar perfil',
            isLoading: false,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Clear error message
       */
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Only persist user, isAuthenticated, and twoFactorEnabled
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        twoFactorEnabled: state.twoFactorEnabled,
      }),
    }
  )
);
