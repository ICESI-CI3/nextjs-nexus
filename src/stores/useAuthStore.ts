import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/src/lib/types';
import { AUTH_CONFIG, ROUTES } from '@/src/lib/constants';
import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  setCookie,
  removeCookie,
} from '@/src/lib/utils';
import { setAuthToken, removeAuthToken } from '@/src/lib/apiClient';
import authService, {
  type LoginResult,
  verify2FA as serviceVerify2FA,
} from '@/src/services/authService';
import { getHighestPriorityRole, filterGenericRoles } from '@/src/lib/roleUtils';

// --------------------------------------------
// Helpers
// --------------------------------------------

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

function msgFromUnknown(e: unknown, fallback = 'Unexpected error'): string {
  if (e instanceof Error && e.message) return e.message;
  const maybe = e as { message?: unknown; response?: { data?: unknown } } | null;
  const respMsg =
    typeof (maybe?.response as { data?: { message?: unknown } })?.data === 'object' &&
    (maybe?.response?.data as { message?: unknown })?.message &&
    typeof (maybe?.response?.data as { message?: unknown })?.message === 'string'
      ? String((maybe?.response?.data as { message?: unknown })?.message)
      : undefined;
  if (respMsg) return respMsg;
  if (typeof maybe?.message === 'string') return maybe.message;
  return fallback;
}

/**
 * Extrae nombres/ids de roles robustamente.
 */
function extractRoleNames(user: User | null): string[] {
  const u = user as unknown as { roleIds?: unknown; roles?: unknown };

  // PRIORIDAD 1: Intentar extraer desde roles[].name (objetos Role con nombres)
  if (Array.isArray(u?.roles)) {
    const rolesArr = u.roles as unknown[];
    const byString = rolesArr.filter(isNonEmptyString) as string[];
    if (byString.length) return byString;

    // Extraer nombres de objetos Role
    const names = rolesArr
      .map((r) => {
        const name = (r as { name?: unknown })?.name;
        return isNonEmptyString(name) ? name : undefined;
      })
      .filter(isNonEmptyString);

    if (names.length) return names;
  }

  // PRIORIDAD 2: Si no hay roles con nombres, usar roleIds como fallback
  if (Array.isArray(u?.roleIds)) {
    return (u.roleIds as unknown[]).filter(isNonEmptyString);
  }

  return [];
}

/**
 * Extrae permisos cuando existan.
 */
function extractPermissionNames(user: User | null): string[] {
  const u = user as unknown as { permissions?: unknown; roles?: unknown };
  if (Array.isArray(u?.permissions)) {
    return (u.permissions as unknown[]).filter(isNonEmptyString);
  }
  if (Array.isArray(u?.roles)) {
    const rolesArr = u.roles as unknown[];
    const out: string[] = [];
    for (const r of rolesArr) {
      const perms = (r as { permissions?: unknown })?.permissions;
      if (Array.isArray(perms)) {
        for (const p of perms) {
          if (isNonEmptyString(p)) out.push(p);
          else if (p && typeof (p as { name?: unknown }).name === 'string') {
            out.push(String((p as { name?: unknown }).name));
          }
        }
      }
    }
    return out;
  }
  return [];
}

// ============================================
// STATE & ACTIONS INTERFACES
// ============================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  twoFactorEnabled: boolean | null; // null = desconocido
  roles: string[]; // role names o ids (según lo que llegue)
  permissions: string[]; // si solo hay roleIds, quedará []
  activeRole: string | null; // Rol activo para determinar la vista (ADMINISTRATOR, ORGANIZER, BUYER, STAFF)
}

interface AuthActions {
  // Setters
  setUser: (user: User | null) => void;
  setTokens: (tokens: { accessToken: string; refreshToken?: string }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTwoFactorEnabled: (enabled: boolean | null) => void;

  // Flujos
  login: (payload: { email: string; password: string }) => Promise<LoginResult>;
  verify2FA: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  fetchProfile: () => Promise<void>;

  // Roles/Permisos
  getRoles: () => string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;

  getPermissions: () => string[];
  hasPermission: (perm: string) => boolean;

  // Active Role (para multi-rol y cambio de vista)
  getActiveRole: () => string | null;
  switchRole: (role: string) => void;
  getAvailableRoles: () => string[]; // Solo roles genéricos del usuario

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
      roles: [],
      permissions: [],
      activeRole: null,

      // ========== SETTERS ==========

      setUser: (user) => {
        const roleNamesOrIds = extractRoleNames(user);
        const permNames = extractPermissionNames(user);

        console.log('[AuthStore] setUser - Roles from user:', roleNamesOrIds);

        // Determinar activeRole automáticamente si no hay uno establecido
        const currentActiveRole = get().activeRole;
        const highestPriorityRole = getHighestPriorityRole(roleNamesOrIds);

        console.log('[AuthStore] setUser - Current activeRole:', currentActiveRole);
        console.log('[AuthStore] setUser - Highest priority role:', highestPriorityRole);

        // Solo establecer automáticamente si:
        // 1. No hay activeRole actual
        // 2. O el activeRole actual ya no está en la lista de roles del usuario
        const shouldSetActiveRole =
          !currentActiveRole ||
          !roleNamesOrIds.some((r) => r.toUpperCase() === currentActiveRole.toUpperCase());

        const finalActiveRole = shouldSetActiveRole ? highestPriorityRole : currentActiveRole;
        console.log('[AuthStore] setUser - Final activeRole:', finalActiveRole);

        set({
          user,
          isAuthenticated: !!user,
          twoFactorEnabled: user?.twoFactorEnabled ?? null,
          roles: roleNamesOrIds,
          permissions: permNames,
          activeRole: finalActiveRole,
        });

        // Sincronizar activeRole con cookies para el middleware
        if (finalActiveRole) {
          setCookie('activeRole', finalActiveRole, 7);
        }
      },

      setTokens: (tokens) => {
        setAuthToken(tokens.accessToken);
        setLocalStorage(AUTH_CONFIG.TOKEN_KEY, tokens.accessToken);
        setCookie(AUTH_CONFIG.TOKEN_KEY, tokens.accessToken, 7); // 7 días
        if (tokens.refreshToken) {
          setLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY, tokens.refreshToken);
        }
        set({ isAuthenticated: true });
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setTwoFactorEnabled: (enabled) => set({ twoFactorEnabled: enabled }),

      // ========== FLOWS ==========

      login: async ({ email, password }) => {
        try {
          set({ isLoading: true, error: null });
          const result = await authService.login(email, password);

          // Si requiere 2FA, no tenemos tokens ni perfil todavía.
          if ('requires2FA' in result && result.requires2FA) {
            set({ isLoading: false, twoFactorEnabled: true });
            return result;
          }

          // Guardar tokens y traer el perfil inmediatamente
          get().setTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });

          // Cargamos el perfil para que el LoginPage pueda redirigir por rol
          await get().fetchProfile();

          set({ isLoading: false });
          return result;
        } catch (e: unknown) {
          const message = msgFromUnknown(e, 'Error al iniciar sesión');
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      verify2FA: async (code: string) => {
        try {
          set({ isLoading: true, error: null });
          const result = await serviceVerify2FA(code);
          if (!result?.accessToken) {
            throw new Error('Invalid 2FA verification response');
          }
          get().setTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });
          await get().fetchProfile();
        } catch (e: unknown) {
          const msg = msgFromUnknown(e, 'Error al verificar 2FA');
          set({ error: msg });
          throw new Error(msg);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await authService.logout();
        } catch (e) {
          console.error('Logout error:', e);
        } finally {
          removeAuthToken();
          removeLocalStorage(AUTH_CONFIG.TOKEN_KEY);
          removeLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY);
          removeCookie(AUTH_CONFIG.TOKEN_KEY);
          removeCookie('activeRole');

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            twoFactorEnabled: null,
            roles: [],
            permissions: [],
            activeRole: null,
          });

          if (typeof window !== 'undefined') {
            window.location.href = ROUTES.LOGIN;
          }
        }
      },

      checkAuth: () => {
        set({ isLoading: true });
        const token = getLocalStorage<string | null>(AUTH_CONFIG.TOKEN_KEY, null);

        if (token) {
          setAuthToken(token);
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            roles: [],
            permissions: [],
            activeRole: null,
          });
        }
      },

      fetchProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          const profile = await authService.getProfile();
          get().setUser(profile);
        } catch (e: unknown) {
          // Check if error is 401/403 (unauthorized/forbidden)
          // Check both Axios error format and our ApiError format
          const axiosError = e as { response?: { status?: number } };
          const apiError = e as { statusCode?: number };
          const isAuthError =
            axiosError.response?.status === 401 ||
            axiosError.response?.status === 403 ||
            apiError.statusCode === 401 ||
            apiError.statusCode === 403;

          // Check if error is about missing roles
          const errorMessage = msgFromUnknown(e, '');
          const isMissingRolesError = errorMessage.toLowerCase().includes('sin roles');

          if (isAuthError || isMissingRolesError) {
            const reason = isAuthError ? 'Token inválido (401/403)' : 'Usuario sin roles asignados';
            console.error(`[AuthStore] ${reason}, haciendo logout...`);
            // Clear all auth state
            await get().logout();
            throw new Error(isAuthError ? 'Sesión expirada' : errorMessage);
          }

          const msg = msgFromUnknown(e, 'Error al cargar perfil');
          console.error('[AuthStore] Failed to fetch profile:', msg);
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        } finally {
          set({ isLoading: false });
        }
      },

      // ========== ROLES/PERMISOS ==========

      getRoles: () => {
        const state = get();
        return state.roles.length ? state.roles : extractRoleNames(state.user);
      },

      hasRole: (role) => {
        const rolesSet = new Set(get().getRoles());
        return rolesSet.has(role);
      },

      hasAnyRole: (list) => {
        const rolesSet = new Set(get().getRoles());
        return list.some((r) => rolesSet.has(r));
      },

      getPermissions: () => {
        const state = get();
        return state.permissions.length ? state.permissions : extractPermissionNames(state.user);
      },

      hasPermission: (perm) => {
        const perms = new Set(get().getPermissions());
        return perms.has(perm);
      },

      // ========== ACTIVE ROLE ==========

      getActiveRole: () => {
        return get().activeRole;
      },

      switchRole: (role) => {
        const availableRoles = get().getAvailableRoles();
        const normalized = role.toUpperCase();

        // Verificar que el rol está disponible para el usuario
        if (!availableRoles.includes(normalized)) {
          console.warn(`Cannot switch to role "${role}" - not available for this user`);
          return;
        }

        set({ activeRole: normalized });
        // Sincronizar con cookies para que el middleware pueda acceder
        setCookie('activeRole', normalized, 7);
      },

      getAvailableRoles: () => {
        const roles = get().getRoles();
        return filterGenericRoles(roles);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        twoFactorEnabled: state.twoFactorEnabled,
        roles: state.roles,
        permissions: state.permissions,
        activeRole: state.activeRole,
      }),
      onRehydrateStorage: () => () => {
        try {
          const token = getLocalStorage<string | null>(AUTH_CONFIG.TOKEN_KEY, null);
          if (token) setAuthToken(token);
        } catch {
          // ignore
        }
      },
    }
  )
);
