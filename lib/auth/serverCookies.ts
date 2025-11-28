// lib/auth/serverCookies.ts - Server-only cookie helpers (uses next/headers)

import { cookies } from 'next/headers';
import { CookieOptions } from '@/types/auth';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data',
  TOKEN_EXPIRES_AT: 'auth_expires_at',
} as const;

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  userData: any,
  expiresIn: number
): Promise<void> {
  const cookieStore = await cookies();
  const tokenExpiresAt = Math.floor(Date.now() / 1000) + expiresIn;

  const refreshTokenMaxAge = 7 * 24 * 60 * 60;

  cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...DEFAULT_COOKIE_OPTIONS,
    maxAge: expiresIn,
  });

  cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    ...DEFAULT_COOKIE_OPTIONS,
    maxAge: refreshTokenMaxAge,
  });

  cookieStore.set(COOKIE_NAMES.TOKEN_EXPIRES_AT, String(tokenExpiresAt), {
    ...DEFAULT_COOKIE_OPTIONS,
    maxAge: refreshTokenMaxAge,
  });

  const userDataString = JSON.stringify(userData || {});

  cookieStore.set(COOKIE_NAMES.USER_DATA, userDataString, {
    ...DEFAULT_COOKIE_OPTIONS,
    maxAge: refreshTokenMaxAge,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
  cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);
  cookieStore.delete(COOKIE_NAMES.USER_DATA);
  cookieStore.delete(COOKIE_NAMES.TOKEN_EXPIRES_AT);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN);
  return token?.value || null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN);
  return token?.value || null;
}

export async function getUserDataFromCookies(): Promise<any | null> {
  const cookieStore = await cookies();
  const userData = cookieStore.get(COOKIE_NAMES.USER_DATA);

  if (!userData?.value) return null;

  try {
    return JSON.parse(userData.value);
  } catch {
    return null;
  }
}

export async function getTokenExpiresAt(): Promise<number | null> {
  const cookieStore = await cookies();
  const expiresAt = cookieStore.get(COOKIE_NAMES.TOKEN_EXPIRES_AT);
  if (!expiresAt?.value) return null;
  return parseInt(expiresAt.value, 10);
}

export async function shouldRefreshToken(): Promise<boolean> {
  const expiresAt = await getTokenExpiresAt();
  if (!expiresAt) return false;
  const now = Math.floor(Date.now() / 1000);
  return expiresAt - now < 5 * 60;
}

export async function verifyAuthCookies(): Promise<boolean> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  return !!(accessToken && refreshToken);
}

export default {
  COOKIE_NAMES,
  setAuthCookies,
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  getUserDataFromCookies,
  getTokenExpiresAt,
  shouldRefreshToken,
  verifyAuthCookies,
};
