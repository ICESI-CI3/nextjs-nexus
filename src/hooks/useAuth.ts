'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/src/stores/useAuthStore';

/**
 * Custom hook to access auth store with React 19 optimization
 * Uses individual selectors to avoid getSnapshot warnings
 */
export function useAuth() {
  // State selectors
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const twoFactorEnabled = useAuthStore((s) => s.twoFactorEnabled);

  // Action selectors
  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);
  const setTwoFactorEnabled = useAuthStore((s) => s.setTwoFactorEnabled);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const clearError = useAuthStore((s) => s.clearError);

  // Initialize auth state on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    twoFactorEnabled,

    // Actions
    setUser,
    setTokens,
    setLoading,
    setError,
    setTwoFactorEnabled,
    login,
    logout,
    checkAuth,
    fetchProfile,
    clearError,
  } as const;
}

export default useAuth;
