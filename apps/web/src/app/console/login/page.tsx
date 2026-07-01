'use client'

import { FormEvent, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, onAuthStateChange } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('🔐 Attempting login:', { email: email.trim() })
      await signIn(email.trim(), password.trim())
      console.log('✓ Login successful')

      // Refresh server state so middleware sees the session cookie
      console.log('🔄 Refreshing server state...')
      router.refresh()

      // Wait for server refresh, then redirect
      setTimeout(() => {
        console.log('✓ Redirecting to /console')
        router.push('/console')
      }, 100)
    } catch (err: any) {
      console.error('❌ Login error:', {
        message: err.message,
        code: err.code,
        status: err.status,
        fullError: err,
      })
      setError(err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-lg shadow-lg p-8 border border-border">
          <h1 className="text-4xl font-bold text-primary mb-2 font-fraunces">
            KnowMind
          </h1>
          <p className="text-text-muted mb-8">Operations Console</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@knowmind.local"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-primary-fg font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-text-muted text-sm">
            Single admin access only
          </p>
        </div>
      </div>
    </div>
  )
}
