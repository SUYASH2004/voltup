import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PROTECTED_ROUTES = [
  '/assets',
  '/work-orders',
  '/reports',
  '/settings',
  '/test-backend',
  '/',
];

const PUBLIC_ROUTES = ['/login', '/forgot-password', '/register'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get the token from cookies
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If already logged in and trying to access login, redirect to home
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require token
  if (PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    if (!token) {
      // Redirect to login with callback URL
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
      );
    }
    return NextResponse.next();
  }

  // For all other routes, proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
