'use client'

import { createClient } from './supabase/client'

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  console.log('🔐 Attempting Supabase auth...')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log('📡 AUTH RESPONSE:')
  console.log('  Has Data:', !!data)
  console.log('  Has Error:', !!error)
  if (data?.user) console.log('  ✅ User:', data.user.email)
  if (error) console.log('  ❌ Error:', error.message)

  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export function onAuthStateChange(callback: (session: any) => void) {
  const supabase = createClient()
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session)
  })
  return subscription
}
