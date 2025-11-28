// lib/auth/clientCookies.ts - Client-side cookie helpers (uses js-cookie / document.cookie)

import Cookies from 'js-cookie';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data',
  TOKEN_EXPIRES_AT: 'auth_expires_at',
} as const;

export function getAccessToken(): string | null {
  try {
    return Cookies.get(COOKIE_NAMES.ACCESS_TOKEN) || null;
  } catch (e) {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return Cookies.get(COOKIE_NAMES.REFRESH_TOKEN) || null;
  } catch (e) {
    return null;
  }
}

export function getUserDataFromCookies(): any | null {
  try {
    const val = Cookies.get(COOKIE_NAMES.USER_DATA);
    if (!val) return null;
    return JSON.parse(val);
  } catch (e) {
    return null;
  }
}

export function getTokenExpiresAt(): number | null {
  try {
    const val = Cookies.get(COOKIE_NAMES.TOKEN_EXPIRES_AT);
    if (!val) return null;
    return parseInt(val, 10);
  } catch (e) {
    return null;
  }
}

export function shouldRefreshToken(): boolean {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return false;
  const now = Math.floor(Date.now() / 1000);
  return expiresAt - now < 5 * 60;
}

export function verifyAuthCookies(): boolean {
  return !!(getAccessToken() && getRefreshToken());
}

export default {
  COOKIE_NAMES,
  getAccessToken,
  getRefreshToken,
  getUserDataFromCookies,
  getTokenExpiresAt,
  shouldRefreshToken,
  verifyAuthCookies,
};
