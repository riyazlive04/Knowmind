import type { NextAuthConfig } from 'next-auth'

// Edge-safe Auth.js config. Contains NO Prisma / Node-only imports so it can run
// in Next.js middleware (Edge runtime). The full config in `auth.ts` spreads this
// and adds the Credentials provider (which uses Prisma and runs in Node).
export const authConfig = {
  pages: {
    signIn: '/console/login',
  },
  callbacks: {
    // Runs in middleware for every matched request. Guards the console.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl
      const isLoginPage = pathname === '/console/login'
      const isConsole = pathname.startsWith('/console')

      if (isConsole && !isLoginPage) {
        // Protected console route: allow only when authenticated. Returning false
        // makes Auth.js redirect to `pages.signIn`.
        return isLoggedIn
      }

      // Already signed in and visiting the login page → send to the console.
      if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL('/console', nextUrl))
      }

      return true
    },
  },
  providers: [], // Added in auth.ts (kept empty here to stay edge-safe).
} satisfies NextAuthConfig
