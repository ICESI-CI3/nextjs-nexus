/**
 * JWT utility functions for token management
 * Provides safe token decoding and expiration checking
 */

interface JwtPayload {
  sub: string;
  email: string;
  roles?: string[];
  exp?: number;
  iat?: number;
}

/**
 * Decode a JWT token without verification (client-side only)
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * @param token - JWT token string
 * @returns true if expired, false if still valid
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

/**
 * Check if a JWT token will expire soon
 * @param token - JWT token string
 * @param thresholdMinutes - Minutes before expiration to consider "expiring soon" (default: 5)
 * @returns true if token will expire within threshold
 */
export function isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  const thresholdSeconds = thresholdMinutes * 60;

  // Check if token expires within the threshold
  return decoded.exp - now < thresholdSeconds;
}

/**
 * Get remaining time until token expiration in seconds
 * @param token - JWT token string
 * @returns Remaining seconds or 0 if expired/invalid
 */
export function getTokenRemainingTime(token: string): number {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);
  const remaining = decoded.exp - now;
  return remaining > 0 ? remaining : 0;
}
