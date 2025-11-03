/**
 * Authentication Service
 */

import apiClient from '@/src/lib/apiClient';
import { AUTH_CONFIG } from '@/src/lib/constants';
import { setLocalStorage, removeLocalStorage } from '@/src/lib/utils';
import type { User } from '@/src/lib/types'; // ← ADD THIS IMPORT

/** Backend response format (snake_case) */
interface TokensResponse {
  access_token: string;
  refresh_token: string;
}

/** Indicates 2FA is required */
interface Requires2FAResponse {
  requires2FA: boolean;
  message?: string;
}

/** Successful login without 2FA */
export interface LoginSuccess {
  requires2FA: false;
  accessToken: string;
  refreshToken: string;
}

/** Login requiring 2FA verification */
export interface LoginNeeds2FA {
  requires2FA: true;
  message?: string;
}

/** Union type for login result */
export type LoginResult = LoginSuccess | LoginNeeds2FA;

/** 2FA setup response */
export interface Setup2FAResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

// ← REMOVE UserProfile interface, use User type instead

/**
 * Persists JWT tokens to localStorage
 * Extracted to avoid duplication
 */
function persistTokens(accessToken: string, refreshToken: string): void {
  setLocalStorage(AUTH_CONFIG.TOKEN_KEY, accessToken);
  setLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Clears all auth-related data from localStorage
 */
function clearAuthData(): void {
  removeLocalStorage(AUTH_CONFIG.TOKEN_KEY);
  removeLocalStorage(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  removeLocalStorage(AUTH_CONFIG.USER_KEY);
}

/**
 * Login with email and password
 * Returns tokens or 2FA requirement
 */
async function login(email: string, password: string): Promise<LoginResult> {
  const response = await apiClient.post<TokensResponse | Requires2FAResponse>('/auth/login', {
    email,
    password,
  });

  const data = response.data;

  // Check if 2FA is required
  if ('requires2FA' in data && data.requires2FA) {
    return {
      requires2FA: true,
      message: data.message,
    };
  }

  // Type assertion after confirming it's not 2FA response
  const tokens = data as TokensResponse;
  persistTokens(tokens.access_token, tokens.refresh_token);

  return {
    requires2FA: false,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}

/**
 * Complete login with 2FA code
 */
async function loginWith2FA(
  email: string,
  password: string,
  totpCode: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await apiClient.post<TokensResponse>('/auth/login-2fa', {
    email,
    password,
    totpCode,
  });

  const { access_token, refresh_token } = response.data;
  persistTokens(access_token, refresh_token);

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
  };
}

/**
 * Refresh access token using refresh token
 */
async function refresh(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await apiClient.post<TokensResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  });

  const { access_token, refresh_token } = response.data;
  persistTokens(access_token, refresh_token);

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
  };
}

/**
 * Logout user and clear tokens
 */
async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    // Always clear local data even if API call fails
    clearAuthData();
  }
}

/**
 * Initialize 2FA setup (get QR code and secret)
 * Requires authentication
 */
async function setup2FA(): Promise<Setup2FAResponse> {
  const response = await apiClient.get<Setup2FAResponse>('/auth/setup-2fa');
  return response.data;
}

/**
 * Enable 2FA by verifying TOTP code
 * Requires authentication
 */
async function enable2FA(totpCode: string): Promise<void> {
  await apiClient.post('/auth/enable-2fa', { totpCode });
}

/**
 * Disable 2FA using TOTP or backup code
 * Requires authentication
 */
async function disable2FA(code: string): Promise<void> {
  await apiClient.post('/auth/disable-2fa', { code });
}

/**
 * Get current user profile
 * Requires authentication
 */
async function getProfile(): Promise<User> {
  // ← CHANGED FROM UserProfile TO User
  const response = await apiClient.get<User>('/auth/profile');
  return response.data;
}

const authService = {
  // Auth
  login,
  loginWith2FA,
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
