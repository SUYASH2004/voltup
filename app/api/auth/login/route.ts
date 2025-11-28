// app/api/auth/login/route.ts - Login endpoint

import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth/serverCookies';
import { LoginRequest, LoginResponse, ApiResponse } from '@/types/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * POST /api/auth/login
 *
 * Flow:
 * 1. Client sends email + password
 * 2. We forward to FastAPI backend
 * 3. Backend returns: userId, username, role, permissions, accessToken, refreshToken, expiresIn
 * 4. We set secure HTTP-only cookies
 * 5. Return user data to client (token is in cookie, not in response)
 *
 * Security:
 * - Tokens are in HTTP-only cookies, not in response
 * - Connection to backend should be HTTPS in production
 * - CORS is handled by backend
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request
    const body = (await request.json()) as LoginRequest;

    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            status: 400,
            message: 'Email and password are required',
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Forward login request to FastAPI backend
    // Backend URL should come from environment variables
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Frontend',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json();

      return NextResponse.json(
        {
          success: false,
          error: {
            status: backendResponse.status,
            message: error.message || 'Login failed',
            code: error.code,
          },
        } as ApiResponse,
        { status: backendResponse.status }
      );
    }

    // Parse successful response
    const loginResponse = (await backendResponse.json()) as LoginResponse;

    // Set secure HTTP-only cookies
    await setAuthCookies(
      loginResponse.accessToken,
      loginResponse.refreshToken,
      {
        userId: loginResponse.userId,
        username: loginResponse.username,
        email: loginResponse.email,
        role: loginResponse.role,
        permissions: loginResponse.permissions,
        region: loginResponse.region,
        circle: loginResponse.circle,
        area: loginResponse.area,
      },
      loginResponse.expiresIn
    );

    // Return user data (without tokens - they're in cookies)
    // Client will read cookies via our auth context
    return NextResponse.json({
      success: true,
      data: {
        userId: loginResponse.userId,
        username: loginResponse.username,
        email: loginResponse.email,
        role: loginResponse.role,
        permissions: loginResponse.permissions,
        region: loginResponse.region,
        circle: loginResponse.circle,
        area: loginResponse.area,
      },
      message: 'Login successful',
    } as ApiResponse);
  } catch (error) {
    console.error('Login error:', error);

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
