'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
      }
    }
    getUser()
  }, [])

  async function handleSignOut() {
    try {
      await signOut()
      router.push('/console/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (!mounted) return null

  return (
    <header className="bg-surface border-b border-border px-4 md:px-6 py-4 flex items-center justify-between min-h-[60px]">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 hover:bg-background rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <span className="text-xl">☰</span>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-background rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted truncate">{userEmail}</span>
        </div>

        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-fg rounded-lg transition-colors min-h-[44px]"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
