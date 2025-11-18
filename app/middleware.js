import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Allow access to login page
    if (pathname.startsWith('/login')) {
      // If already logged in, redirect to dashboard
      if (token) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return NextResponse.next();
    }

    // Protect all other routes - redirect to login if no token
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if session is expired (24 hours)
    const now = Math.floor(Date.now() / 1000);
    const tokenIat = token.iat || 0;
    const maxAge = 24 * 60 * 60; // 24 hours
    
    if (tokenIat && (now - tokenIat) > maxAge) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('error', 'SessionExpired');
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow login page without token
        if (pathname.startsWith('/login')) {
          return true;
        }
        
        // Require valid token for all other pages
        if (!token) {
          return false;
        }
        
        // Check token expiration
        const now = Math.floor(Date.now() / 1000);
        const tokenIat = token.iat || 0;
        const maxAge = 24 * 60 * 60; // 24 hours
        
        if (tokenIat && (now - tokenIat) > maxAge) {
          return false; // Token expired
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes - handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
