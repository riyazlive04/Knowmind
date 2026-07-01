'use client'

import { ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function ConsoleShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-cream dark:bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto scroll-smooth p-5 md:p-8">
          {/* Keying on the route makes the content re-run its enter animation on
              every navigation, so page changes feel like a smooth transition. */}
          <div key={pathname} className="mx-auto w-full max-w-7xl animate-page">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
