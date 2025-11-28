// app/api/auth/refresh/route.ts - Token refresh endpoint

import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies, getAccessToken, getRefreshToken } from '@/lib/auth/serverCookies';
import { RefreshTokenResponse, ApiResponse } from '@/types/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * POST /api/auth/refresh
 *
 * Flow:
 * 1. Get refresh token from cookies
 * 2. Send to FastAPI backend to get new access token
 * 3. Backend returns new accessToken, expiresIn
 * 4. Update cookies with new access token
 * 5. Return new access token to client
 *
 * Note: This is called from client-side when token is about to expire
 *
 * Security:
 * - Only refresh token is sent to backend (in cookie)
 * - New access token is set in cookie
 * - Client can cache the new token briefly if needed
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            status: 401,
            message: 'No refresh token available',
          },
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Send refresh request to FastAPI backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json();

      // If refresh fails, we need to re-authenticate
      return NextResponse.json(
        {
          success: false,
          error: {
            status: backendResponse.status,
            message: error.message || 'Token refresh failed',
            code: error.code,
          },
        } as ApiResponse,
        { status: backendResponse.status }
      );
    }

    // Parse response
    const refreshResponse = (await backendResponse.json()) as RefreshTokenResponse;

    // Get current user data (we're just refreshing the token, not changing user)
    // For now, we'll just update the access token
    // In a real scenario, you might want to get fresh user data from backend

    // Update the access token cookie
    const accessToken = await getAccessToken();
    if (accessToken) {
      // Get user data from the existing cookie to update it
      // This is a simplified approach - in production, you might want fresh data from backend
      const cookieStore = await require('next/headers').cookies();
      const userDataCookie = cookieStore.get('auth_user_data');

      if (userDataCookie?.value) {
        try {
          const userData = JSON.parse(userDataCookie.value);

          await setAuthCookies(
            refreshResponse.accessToken,
            refreshToken, // Keep same refresh token
            userData,
            refreshResponse.expiresIn
          );
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          // Proceed without updating user data
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        accessToken: refreshResponse.accessToken,
        expiresIn: refreshResponse.expiresIn,
      },
      message: 'Token refreshed successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Token refresh error:', error);

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
