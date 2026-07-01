'use client'

import { FormEvent, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, onAuthStateChange } from '@/lib/auth'
import { Button, Card, Input } from '@/components/ui'

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
    <div className="flex items-center justify-center min-h-screen bg-cream px-4">
      <div className="w-full max-w-md">
        <Card tone="base" className="!p-8">
          <img src="/logo.png" alt="KnowMind Universe" className="h-12 w-auto mb-4" />
          <h1 className="text-4xl font-display font-bold text-purple-800 mb-2">
            KnowMind
          </h1>
          <p className="text-ink-500 mb-8">Operations Console</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@knowmind.local"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink-700 mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-danger-soft border border-danger/30 rounded-md text-danger text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-ink-400 text-sm">
            Single admin access only
          </p>
        </Card>
      </div>
    </div>
  )
}
