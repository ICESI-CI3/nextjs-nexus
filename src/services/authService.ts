/**
 * Authentication Service (axios-based)
 * - Normaliza snake_case → camelCase.
 * - Persiste tokens e instala Authorization header.
 * - Login con/sin 2FA, verify2FA, refresh, logout, getProfile.
 */

import apiClient, { setAuthToken, removeAuthToken } from '@/src/lib/apiClient';
import { AUTH_CONFIG } from '@/src/lib/constants';
import { setLocalStorage, removeLocalStorage, getLocalStorage } from '@/src/lib/utils';
import type { User } from '@/src/lib/types';

/** Backend response format (snake_case) */
interface TokensResponse {
  access_token: string;
  refresh_token: string;
}

/** Indica que 2FA es requerido */
interface Requires2FAResponse {
  requires2FA: boolean;
  message?: string;
}

/** Login exitoso sin 2FA */
export interface LoginSuccess {
  requires2FA: false;
  accessToken: string;
  refreshToken: string;
}

/** Login que requiere 2FA */
export interface LoginNeeds2FA {
  requires2FA: true;
  message?: string;
}

/** Union para el resultado de login */
export type LoginResult = LoginSuccess | LoginNeeds2FA;

/** Respuesta típica de setup 2FA */
export interface Setup2FAResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

/** Normaliza un error desconocido a string sin usar `any` */
function normalizeError(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;

  // axios-like
  const maybe = e as {
    response?: { data?: unknown; status?: number };
    message?: unknown;
  } | null;

  const msgFromResponse =
    typeof maybe?.response?.data === 'string'
      ? (maybe.response.data as string)
      : typeof (maybe?.response as { data?: { message?: unknown } })?.data === 'object' &&
          maybe?.response &&
          (maybe.response.data as { message?: unknown })?.message &&
          typeof (maybe.response.data as { message?: unknown })?.message === 'string'
        ? String((maybe.response.data as { message?: unknown })?.message)
        : undefined;

  if (msgFromResponse) return msgFromResponse;
  if (typeof maybe?.message === 'string') return maybe.message;

  try {
    return JSON.stringify(e);
  } catch {
    return 'Unexpected error';
  }
}

/** Persistir tokens e instalar Authorization inmediatamente */
function persistTokens(accessToken: string, refreshToken?: string): void {
  setAuthToken(accessToken);
  setLocalStorage(AUTH_CONFIG.TOKEN_KEY, accessToken);
  if (refreshToken) setLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
}

/** Borrar auth local y header */
function clearAuthData(): void {
  removeAuthToken();
  removeLocalStorage(AUTH_CONFIG.TOKEN_KEY);
  removeLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  removeLocalStorage(AUTH_CONFIG.USER_KEY);
}

/** Login email+password */
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const { data } = await apiClient.post<TokensResponse | Requires2FAResponse>('/auth/login', {
      email,
      password,
    });

    if ('requires2FA' in data && data.requires2FA) {
      return { requires2FA: true, message: data.message };
    }

    const tokens = data as TokensResponse;
    persistTokens(tokens.access_token, tokens.refresh_token);

    return {
      requires2FA: false,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  } catch (e: unknown) {
    throw new Error(normalizeError(e));
  }
}

/** Login en un paso con TOTP (si tu backend lo soporta) */
export async function loginWith2FA(
  email: string,
  password: string,
  totpCode: string
): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const { data } = await apiClient.post<TokensResponse>('/auth/login-2fa', {
      email,
      password,
      totpCode,
    });
    persistTokens(data.access_token, data.refresh_token);
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  } catch (e: unknown) {
    throw new Error(normalizeError(e));
  }
}

/** Verificar 2FA después de un login que devolvió requires2FA */
export async function verify2FA(
  code: string
): Promise<{ accessToken: string; refreshToken?: string }> {
  try {
    const { data } = await apiClient.post<TokensResponse>('/auth/verify-2fa', { code });
    persistTokens(data.access_token, data.refresh_token);
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  } catch (e: unknown) {
    throw new Error(normalizeError(e));
  }
}

/** Refrescar access token con refresh token */
export async function refresh(
  refreshTokenArg?: string
): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const refreshToken =
      refreshTokenArg || getLocalStorage<string | null>(AUTH_CONFIG.REFRESH_TOKEN_KEY, null) || '';

    const { data } = await apiClient.post<TokensResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    persistTokens(data.access_token, data.refresh_token);
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  } catch (e: unknown) {
    clearAuthData();
    throw new Error(normalizeError(e));
  }
}

/** Logout: limpia incluso si la API falla */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // noop
  } finally {
    clearAuthData();
  }
}

/** Iniciar setup 2FA (QR + secret) */
export async function setup2FA(): Promise<Setup2FAResponse> {
  try {
    const { data } = await apiClient.get<Setup2FAResponse>('/auth/setup-2fa');
    return data;
  } catch (e: unknown) {
    throw new Error(normalizeError(e));
  }
}

/** Habilitar 2FA */
export async function enable2FA(totpCode: string): Promise<void> {
  try {
    await apiClient.post('/auth/enable-2fa', { totpCode });
  } catch (e: unknown) {
    throw new Error(normalizeError(e));
  }
}

/** Deshabilitar 2FA */
export async function disable2FA(code: string): Promise<void> {
  try {
    await apiClient.post('/auth/disable-2fa', { code });
  } catch (e: unknown) {
    throw new Error(normalizeError(e));
  }
}

/** Perfil actual (usa ruta configurable si existe) */
export async function getProfile(): Promise<User> {
  try {
    // apiClient ya tiene baseURL configurada
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  } catch (e: unknown) {
    throw new Error(normalizeError(e));
  }
}

const authService = {
  // Auth
  login,
  loginWith2FA,
  verify2FA,
  refresh,
  logout,
  // 2FA
  setup2FA,
  enable2FA,
  disable2FA,
  // Profile
  getProfile,
};

export default authService;
