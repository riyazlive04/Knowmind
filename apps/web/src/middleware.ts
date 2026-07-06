import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// Edge middleware: uses only the edge-safe config (no Prisma). The `authorized`
// callback in auth.config.ts decides access and redirects to the login page.
export default NextAuth(authConfig).auth

export const config = {
  // Run on everything except Next internals, the auth API, and static assets.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
