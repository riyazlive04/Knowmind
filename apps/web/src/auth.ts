import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma, verifyPassword } from '@knowmind/db'
import { authConfig } from './auth.config'

// Full Auth.js instance (Node runtime). Single-admin console login: credentials
// are checked against the `admin_user` table; sessions are stateless JWTs.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase()
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const admin = await prisma.adminUser.findUnique({ where: { email } })
        if (!admin) return null

        const ok = await verifyPassword(password, admin.password_hash)
        if (!ok) return null

        return { id: admin.id, email: admin.email, name: admin.name ?? undefined }
      },
    }),
  ],
})
