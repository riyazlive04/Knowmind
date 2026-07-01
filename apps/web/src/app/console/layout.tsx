'use client'

import { usePathname } from 'next/navigation'
import { ConsoleShell } from '@/components/ConsoleShell'

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Don't wrap login page with sidebar
  if (pathname === '/console/login') {
    return children
  }

  return <ConsoleShell>{children}</ConsoleShell>
}
