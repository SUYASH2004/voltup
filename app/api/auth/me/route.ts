// app/api/auth/me/route.ts - Get current user endpoint

import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, getUserDataFromCookies } from '@/lib/auth/serverCookies';
import { extractUserFromToken } from '@/lib/auth/jwt';
import { ApiResponse, AuthUser } from '@/types/auth';

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user
 * Called on app startup to check if user is still logged in
 *
 * Security:
 * - Reads from HTTP-only cookies set by server
 * - Token signature not verified here (verified on backend originally)
 * - Can add additional server-side validation if needed
 */
export async function GET(request: NextRequest) {
  try {
    // Get access token from cookies
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            status: 401,
            message: 'Not authenticated',
          },
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Extract user from token
    const user = extractUserFromToken(accessToken);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            status: 401,
            message: 'Invalid or expired token',
          },
        } as ApiResponse,
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User retrieved successfully',
    } as ApiResponse<AuthUser>);
  } catch (error) {
    console.error('Get user error:', error);

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
