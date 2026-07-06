'use client'

import {
  signIn as naSignIn,
  signOut as naSignOut,
  getSession as naGetSession,
} from 'next-auth/react'

// Client-side auth helpers backed by Auth.js (NextAuth v5). These wrap the
// standalone next-auth/react functions so callers don't need a SessionProvider.

export async function signIn(email: string, password: string) {
  const res = await naSignIn('credentials', {
    email,
    password,
    redirect: false,
  })
  if (!res || res.error) {
    throw new Error('Invalid email or password')
  }
  return res
}

export async function signOut() {
  await naSignOut({ redirect: false })
}

export async function getSession() {
  return naGetSession()
}
