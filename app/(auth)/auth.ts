import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import { type JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';

import { getUser } from '@/lib/db/queries';

import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials) return null;
        
        const email = credentials.email as string;
        const password = credentials.password as string;
        
        if (!email || !password) return null;
        
        const users = await getUser(email);
        if (users.length === 0) return null;
        // biome-ignore lint: Forbidden non-null assertion.
        const passwordsMatch = await compare(password, users[0].password!);
        if (!passwordsMatch) return null;
        return users[0] as User;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }: { session: ExtendedSession; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
});
