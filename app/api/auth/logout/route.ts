// app/api/auth/logout/route.ts - Logout endpoint

import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies, getRefreshToken } from '@/lib/auth/serverCookies';
import { ApiResponse } from '@/types/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * POST /api/auth/logout
 *
 * Flow:
 * 1. Get refresh token from cookies
 * 2. Send logout request to FastAPI backend (for server-side cleanup/revocation)
 * 3. Clear all auth cookies
 * 4. Return success
 *
 * Security:
 * - Cookies are cleared client-side
 * - Backend should also revoke/blacklist the refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token to send to backend
    const refreshToken = await getRefreshToken();

    // Notify backend about logout (optional but recommended)
    // This allows backend to revoke the token
    if (refreshToken) {
      try {
        await fetch(`${BACKEND_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // Log but don't fail - we'll still clear cookies locally
        console.error('Failed to notify backend of logout:', error);
      }
    }

    // Clear auth cookies
    await clearAuthCookies();

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    } as ApiResponse);
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
