import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname === '/' || nextUrl.pathname.startsWith('/(dashboard)');
      const isOnLogin = nextUrl.pathname === '/login';
      const isOnRegister = nextUrl.pathname === '/register';
      
      // Allow access to login/register pages when not logged in
      if (!isLoggedIn && (isOnLogin || isOnRegister)) {
        return true;
      }
      
      // Redirect to dashboard when logged in and trying to access login/register
      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl));
      }
      
      // Protect dashboard and other pages when not logged in
      if (!isLoggedIn && isOnDashboard) {
        return Response.redirect(new URL('/login', nextUrl));
      }
      
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
