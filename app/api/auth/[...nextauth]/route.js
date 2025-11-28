import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Mock user database - TEMPORARY (for development only)
// When backend is ready, replace with actual API call
// All mock users have FULL PERMISSIONS for development
const MOCK_USERS = [
  {
    id: '1',
    email: 'regional.west@voltup.com',
    password: 'password123',
    name: 'West Regional Head',
    role: 'regional_head',
    region: 'west',
    circle: null,
    area: null,
    permissions: [
      'vehicle.view', 'vehicle.edit', 'vehicle.create', 'vehicle.delete',
      'battery.view', 'battery.edit', 'battery.create', 'battery.delete',
      'station.view', 'station.edit', 'station.create', 'station.delete',
      'tcu.view', 'tcu.edit', 'tcu.create', 'tcu.delete',
    ],
  },
  {
    id: '2',
    email: 'regional.east@voltup.com',
    password: 'password123',
    name: 'East Regional Head',
    role: 'regional_head',
    region: 'east',
    circle: null,
    area: null,
    permissions: [
      'vehicle.view', 'vehicle.edit', 'vehicle.create', 'vehicle.delete',
      'battery.view', 'battery.edit', 'battery.create', 'battery.delete',
      'station.view', 'station.edit', 'station.create', 'station.delete',
      'tcu.view', 'tcu.edit', 'tcu.create', 'tcu.delete',
    ],
  },
  {
    id: '3',
    email: 'regional.north@voltup.com',
    password: 'password123',
    name: 'North Regional Head',
    role: 'regional_head',
    region: 'north',
    circle: null,
    area: null,
    permissions: [
      'vehicle.view', 'vehicle.edit', 'vehicle.create', 'vehicle.delete',
      'battery.view', 'battery.edit', 'battery.create', 'battery.delete',
      'station.view', 'station.edit', 'station.create', 'station.delete',
      'tcu.view', 'tcu.edit', 'tcu.create', 'tcu.delete',
    ],
  },
  {
    id: '4',
    email: 'regional.south@voltup.com',
    password: 'password123',
    name: 'South Regional Head',
    role: 'regional_head',
    region: 'south',
    circle: null,
    area: null,
    permissions: [
      'vehicle.view', 'vehicle.edit', 'vehicle.create', 'vehicle.delete',
      'battery.view', 'battery.edit', 'battery.create', 'battery.delete',
      'station.view', 'station.edit', 'station.create', 'station.delete',
      'tcu.view', 'tcu.edit', 'tcu.create', 'tcu.delete',
    ],
  },
  {
    id: '5',
    email: 'circle.mumbai@voltup.com',
    password: 'password123',
    name: 'Mumbai Circle Head',
    role: 'circle_head',
    region: 'west',
    circle: 'mumbai',
    area: null,
    permissions: [
      'vehicle.view', 'vehicle.edit', 'vehicle.create',
      'battery.view', 'battery.edit', 'battery.create',
      'station.view', 'station.edit', 'station.create',
      'tcu.view', 'tcu.edit', 'tcu.create',
    ],
  },
  {
    id: '6',
    email: 'circle.delhi@voltup.com',
    password: 'password123',
    name: 'Delhi Circle Head',
    role: 'circle_head',
    region: 'north',
    circle: 'delhi',
    area: null,
    permissions: [
      'vehicle.view', 'vehicle.edit', 'vehicle.create',
      'battery.view', 'battery.edit', 'battery.create',
      'station.view', 'station.edit', 'station.create',
      'tcu.view', 'tcu.edit', 'tcu.create',
    ],
  },
  {
    id: '7',
    email: 'area.andheri@voltup.com',
    password: 'password123',
    name: 'Andheri Area Head',
    role: 'area_head',
    region: 'west',
    circle: 'mumbai',
    area: 'andheri',
    permissions: [
      'vehicle.view', 'vehicle.edit',
      'battery.view', 'battery.edit',
      'station.view', 'station.edit',
      'tcu.view', 'tcu.edit',
    ],
  },
  {
    id: '8',
    email: 'area.bandra@voltup.com',
    password: 'password123',
    name: 'Bandra Area Head',
    role: 'area_head',
    region: 'west',
    circle: 'mumbai',
    area: 'bandra',
    permissions: [
      'vehicle.view', 'vehicle.edit',
      'battery.view', 'battery.edit',
      'station.view', 'station.edit',
      'tcu.view', 'tcu.edit',
    ],
  },
];

/**
 * Authenticate against mock database
 * TEMPORARY: This will be replaced with backend API call
 */
async function authenticateUser(email, password) {
  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Check mock database
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    region: user.region,
    circle: user.circle,
    area: user.area,
    permissions: user.permissions,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Strict validation
          if (!credentials?.email || !credentials?.password) {
            console.error('[Auth] Missing credentials');
            return null;
          }

          // Authenticate user
          const user = await authenticateUser(credentials.email, credentials.password);

          console.log('[Auth] User authenticated:', user.email);
          return user;
        } catch (error) {
          console.error('[Auth] Authentication failed:', error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.region = user.region;
        token.circle = user.circle;
        token.area = user.area;
        token.permissions = user.permissions || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.region = token.region;
        session.user.circle = token.circle;
        session.user.area = token.area;
        session.user.permissions = token.permissions || [];
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || 'draive-secret-key-2024',
  trustHost: true,
  // Disable CSRF for credentials provider (we're using JWT)
  // CSRF protection is still handled by SameSite cookie policy
  skipCSRFCheck: true,
});

export const { GET, POST } = handlers;
