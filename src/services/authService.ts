import apiClient from '@/src/lib/apiClient';
import { AUTH_CONFIG } from '@/src/lib/constants';
import { setLocalStorage, removeLocalStorage } from '@/src/lib/utils';

type TokensSnake = { access_token: string; refresh_token: string };
type LoginOk = { requires2FA: false; accessToken: string; refreshToken: string };
type LoginNeeds2FA = { requires2FA: true; message?: string };
export type LoginResult = LoginOk | LoginNeeds2FA;

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await apiClient.post('/auth/login', { email, password });
  const data = res?.data as TokensSnake | { requires2FA: boolean; message?: string };

  if ('requires2FA' in data && data.requires2FA) {
    return { requires2FA: true, message: data.message };
  }

  const { access_token, refresh_token } = data as TokensSnake;
  // Persist tokens
  setLocalStorage(AUTH_CONFIG.TOKEN_KEY, access_token);
  setLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY, refresh_token);
  return { requires2FA: false, accessToken: access_token, refreshToken: refresh_token };
}

export async function loginWith2FA(
  email: string,
  password: string,
  totpCode: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await apiClient.post('/auth/login-2fa', { email, password, totpCode });
  const { access_token, refresh_token } = res.data as TokensSnake;
  setLocalStorage(AUTH_CONFIG.TOKEN_KEY, access_token);
  setLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY, refresh_token);
  return { accessToken: access_token, refreshToken: refresh_token };
}

export async function refresh(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
  const { access_token, refresh_token } = res.data as TokensSnake;
  setLocalStorage(AUTH_CONFIG.TOKEN_KEY, access_token);
  setLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY, refresh_token);
  return { accessToken: access_token, refreshToken: refresh_token };
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    removeLocalStorage(AUTH_CONFIG.TOKEN_KEY);
    removeLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    removeLocalStorage(AUTH_CONFIG.USER_KEY);
  }
}

// 2FA helpers (para siguientes pantallas)
export async function setup2FA(): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> {
  const res = await apiClient.get('/auth/setup-2fa');
  return res.data as { secret: string; qrCodeUrl: string; backupCodes: string[] };
}

export async function enable2FA(totpCode: string): Promise<void> {
  await apiClient.post('/auth/enable-2fa', { totpCode });
}

export async function disable2FA(code: string): Promise<void> {
  await apiClient.post('/auth/disable-2fa', { code });
}

export async function getProfile(): Promise<{
  id: string;
  email: string;
  twoFactorEnabled: boolean;
}> {
  const res = await apiClient.get('/auth/profile');
  return res.data as { id: string; email: string; twoFactorEnabled: boolean };
}

const authService = {
  login,
  loginWith2FA,
  refresh,
  logout,
  setup2FA,
  enable2FA,
  disable2FA,
  getProfile,
};

export default authService;
