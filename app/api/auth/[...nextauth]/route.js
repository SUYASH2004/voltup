import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Mock user database
const users = [
  {
    id: '1',
    email: 'regional.west@voltup.com',
    password: 'password123',
    name: 'West Regional Head',
    role: 'regional_head',
    region: 'west',
    circle: null,
    area: null,
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
  },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = users.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          region: user.region,
          circle: user.circle,
          area: user.area,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.region = user.region;
        token.circle = user.circle;
        token.area = user.area;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.region = token.region;
        session.user.circle = token.circle;
        session.user.area = token.area;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || 'draive-secret-key-2024',
  trustHost: true,
});

export const { GET, POST } = handlers;
