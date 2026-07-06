'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { signOut, getSession } from '@/lib/auth'
import { Button } from '@/components/ui'
import { Menu, Sun, Moon, LogOut } from 'lucide-react'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const loadUser = async () => {
      const session = await getSession()
      if (session?.user?.email) {
        setUserEmail(session.user.email)
      }
    }
    loadUser()
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
    <header className="bg-surface/95 backdrop-blur border-b border-border px-4 md:px-6 py-3 flex items-center justify-between min-h-[64px] sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 hover:bg-background rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-text"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-background rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-text"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Moon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {userEmail && (
          <div className="hidden sm:flex items-center gap-2 pl-1 pr-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase">
              {userEmail.charAt(0)}
            </span>
            <span className="text-sm text-text-muted truncate max-w-[180px]">
              {userEmail}
            </span>
          </div>
        )}

        <Button
          variant="purple"
          onClick={handleSignOut}
          className="h-10 px-4 text-sm"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign Out
        </Button>
      </div>
    </header>
  )
}
