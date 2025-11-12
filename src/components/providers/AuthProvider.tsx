'use client';

/**
 * AuthProvider Component
 * Initializes authentication state on app mount
 * Hydrates user data from token if available
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { AUTH_CONFIG } from '@/src/lib/constants';
import { isTokenExpired } from '@/src/lib/jwtUtils';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const logout = useAuthStore((s) => s.logout);
  const setLoading = useAuthStore((s) => s.setLoading);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a token in localStorage
        const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);

        console.log('[AuthProvider] Inicializando auth, token existe:', !!token, 'user:', !!user);

        // Validate token expiration
        if (token && isTokenExpired(token)) {
          console.log('[AuthProvider] Token expirado, limpiando estado...');
          await logout();
          setIsHydrated(true);
          return;
        }

        if (token && !user) {
          // If we have a token but no user, fetch the profile
          console.log('[AuthProvider] Fetching profile...');
          setLoading(true);
          await fetchProfile();
        }
      } catch (error) {
        console.error('[AuthProvider] Failed to initialize auth:', error);
        // Token is invalid or expired, clear ALL auth state
        console.log('[AuthProvider] Limpiando estado completo por error...');
        await logout();
      } finally {
        setLoading(false);
        setIsHydrated(true);
        console.log('[AuthProvider] Hydration completa');
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount - store functions are stable and user causes infinite loop

  // Show nothing until hydration is complete to avoid flash of wrong state
  if (!isHydrated) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
