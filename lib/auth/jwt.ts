// lib/auth/jwt.ts - JWT parsing and validation

import { JWTPayload, AuthUser } from '@/types/auth';

/**
 * Decode JWT without verification (for reading payload)
 * NOTE: This does NOT verify the signature
 * Always verify on backend. This is for extracting claims client-side.
 *
 * @param token - JWT token
 * @returns Decoded payload or null if invalid format
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');

    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Decode payload (second part)
    // Need to add padding for base64url
    const payload = parts[1];
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = JSON.parse(Buffer.from(padded, 'base64').toString());

    return decoded as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token has expired
 *
 * @param token - JWT token
 * @returns true if expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);

    if (!payload || !payload.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (error) {
    console.error('Failed to check token expiration:', error);
    return true;
  }
}

/**
 * Extract user data from JWT token
 * Used to populate auth context after login
 *
 * @param token - JWT token
 * @returns AuthUser object or null if token invalid
 */
export function extractUserFromToken(token: string): AuthUser | null {
  try {
    const payload = decodeJWT(token);

    if (!payload) {
      return null;
    }

    // Verify token hasn't expired
    if (isTokenExpired(token)) {
      console.warn('Token has expired');
      return null;
    }

    return {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
      region: payload.region,
      circle: payload.circle,
      area: payload.area,
    };
  } catch (error) {
    console.error('Failed to extract user from token:', error);
    return null;
  }
}

/**
 * Get time until token expires (in seconds)
 *
 * @param token - JWT token
 * @returns Seconds until expiration, or 0 if already expired
 */
export function getTokenExpiresIn(token: string): number {
  try {
    const payload = decodeJWT(token);

    if (!payload || !payload.exp) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = payload.exp - now;

    return Math.max(0, expiresIn);
  } catch (error) {
    console.error('Failed to get token expiration time:', error);
    return 0;
  }
}

/**
 * Verify JWT signature using RS256 (RSA)
 * This is called server-side to validate tokens from FastAPI
 *
 * @param token - JWT token
 * @param publicKey - RSA public key (PEM format)
 * @returns true if signature is valid
 */
export async function verifyJWTSignature(
  token: string,
  publicKey: string
): Promise<boolean> {
  try {
    // This requires Node.js crypto
    const crypto = require('crypto');

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify signature
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(`${headerB64}.${payloadB64}`);

    return verify.verify(publicKey, Buffer.from(signatureB64, 'base64'));
  } catch (error) {
    console.error('Failed to verify JWT signature:', error);
    return false;
  }
}
