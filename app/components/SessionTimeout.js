'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function SessionTimeout() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only check session expiration if we have a valid session
    // Don't redirect - let middleware handle that
    if (status !== 'authenticated' || !session) return;

    // Check session expiration every 5 minutes (less frequent)
    const checkInterval = setInterval(() => {
      if (session?.expires) {
        const expiresAt = new Date(session.expires).getTime();
        const now = Date.now();
        
        // Check if session expires in next 5 minutes
        if (now >= expiresAt - 5 * 60 * 1000) {
          signOut({ callbackUrl: '/login?error=SessionExpired' });
          clearInterval(checkInterval);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(checkInterval);
  }, [session, status]);

  return null;
}

