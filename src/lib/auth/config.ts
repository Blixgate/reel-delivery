import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare, hash } from 'bcryptjs';

// In-memory user store for beta - replace with DB later
const users: Map<string, { id: string; email: string; name: string; passwordHash: string }> = new Map();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        action: { label: 'Action', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        const name = credentials?.name as string;
        const action = credentials?.action as string;

        if (!email || !password) return null;

        if (action === 'register') {
          // Register new user
          if (users.has(email)) {
            throw new Error('Email already registered');
          }
          const passwordHash = await hash(password, 12);
          const id = crypto.randomUUID();
          const user = { id, email, name: name || email.split('@')[0], passwordHash };
          users.set(email, user);
          return { id, email: user.email, name: user.name };
        }

        // Login
        const user = users.get(email);
        if (!user) {
          throw new Error('No account found with this email');
        }

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard && !isLoggedIn) {
        return Response.redirect(new URL('/login', nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'reel-delivery-beta-secret-key-change-in-production',
});
