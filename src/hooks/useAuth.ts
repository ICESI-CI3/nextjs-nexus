'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/src/stores/useAuthStore';

// Nota React 19: para evitar la advertencia "The result of getSnapshot should be cached",
// usa selectores por propiedad/acción en lugar de leer todo el estado de una vez.
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  // actions
  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const clearError = useAuthStore((s) => s.clearError);

  // Inicializa el estado de autenticación al primer uso
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setTokens,
    setLoading,
    setError,
    login,
    register,
    logout,
    checkAuth,
    fetchProfile,
    clearError,
  } as const;
}

export default useAuth;
