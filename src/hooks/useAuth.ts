'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/src/stores/useAuthStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const twoFactorEnabled = useAuthStore((s) => s.twoFactorEnabled);

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

  const getRoles = useAuthStore((s) => s.getRoles);
  const getPermissions = useAuthStore((s) => s.getPermissions);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  useEffect(() => {
    if (isLoading) {
      checkAuth();
    }
  }, [isLoading, checkAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    twoFactorEnabled,
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
    getRoles,
    getPermissions,
    hasPermission,
  } as const;
}

/** Hook optimizado para permisos. Export nombrado. */
export const useCan = (permissionName: string): boolean => {
  // Se vuelve a evaluar cuando cambie el store y solo re-renderiza si el booleano cambia
  return useAuthStore((state) => state.hasPermission(permissionName));
};

export default useAuth;
