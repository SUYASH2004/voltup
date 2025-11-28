// types/next-auth.d.ts - NextAuth type extensions

import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
    region?: string;
    circle?: string;
    area?: string;
    permissions?: string[];
  }

  interface Session {
    user: User & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    email?: string;
    role?: string;
    region?: string;
    circle?: string;
    area?: string;
    permissions?: string[];
  }
}
