'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/src/lib/constants';
import { useAuth } from './useAuth';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * Guard para un único rol requerido.
 * - Evita bucles de redirect mientras se resuelven roles.
 * - Pide el perfil una sola vez si no hay roles.
 * - Normaliza comparaciones de roles.
 * - No lee `ref.current` durante render (cumple react-hooks/refs).
 */
export function useRequireRole(requiredRole: string) {
  const router = useRouter();
  const pathname = usePathname();

  // Estado auth (checkAuth se dispara dentro de useAuth en el mount)
  const { isAuthenticated, isLoading } = useAuth();

  // Store
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  // Track de una única solicitud de perfil
  const requestedProfileRef = useRef(false);
  const [profileResolved, setProfileResolved] = useState(false);

  // Normalización
  const norm = (v: string) => v.trim().toUpperCase();
  const required = useMemo(() => norm(requiredRole), [requiredRole]);
  const normalizedRoles = useMemo(() => roles.map(norm), [roles]);

  // ¿Tiene el rol?
  const hasRole = useMemo(() => normalizedRoles.includes(required), [normalizedRoles, required]);

  // Auth listo cuando no se está cargando y ya sabemos si hay user
  const authReady = !isLoading && (isAuthenticated || user !== null);

  // Roles resueltos si ya tenemos alguno o si el fetch terminó
  const rolesResolved = normalizedRoles.length > 0 || profileResolved;

  // Pedir perfil una vez si hace falta
  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) return;

    if (normalizedRoles.length === 0 && !requestedProfileRef.current) {
      requestedProfileRef.current = true;
      fetchProfile()
        .catch(() => {
          /* noop: decidimos con rolesResolved=true igual */
        })
        .finally(() => setProfileResolved(true));
    }
  }, [authReady, isAuthenticated, normalizedRoles.length, fetchProfile]);

  // Redirects con protección de bucles
  useEffect(() => {
    if (!authReady) return;

    // No autenticado → login
    if (!isAuthenticated) {
      if (pathname !== ROUTES.LOGIN) router.replace(ROUTES.LOGIN);
      return;
    }

    // Esperar roles
    if (!rolesResolved) return;

    // Autenticado sin rol → events (pantalla principal)
    if (!hasRole) {
      if (pathname !== ROUTES.EVENTS) router.replace(ROUTES.EVENTS);
      return;
    }
  }, [authReady, isAuthenticated, rolesResolved, hasRole, router, pathname]);

  // Debug solo en efectos para no leer ref en render
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[useRequireRole]', {
        path: pathname,
        isAuthenticated,
        isLoading,
        userPresent: !!user,
        roles,
        normalizedRoles,
        required,
        hasRole,
        requestedProfile: requestedProfileRef.current,
        profileResolved,
        authReady,
        rolesResolved,
      });
    }
  }, [
    pathname,
    isAuthenticated,
    isLoading,
    user,
    roles,
    normalizedRoles,
    required,
    hasRole,
    profileResolved,
    authReady,
    rolesResolved,
  ]);

  // Flag de carga del guard
  const guardLoading = !authReady || (isAuthenticated && !rolesResolved);

  return {
    isLoading: guardLoading,
    isAuthenticated,
    isAuthorized: hasRole,
  } as const;
}

export default useRequireRole;
