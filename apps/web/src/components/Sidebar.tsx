'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  ListChecks,
  BarChart3,
  Send,
  Settings,
  ExternalLink,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Overview', href: '/console', Icon: LayoutDashboard },
  { label: 'Members', href: '/console/members', Icon: Users },
  { label: 'Records / Reports', href: '/console/reports', Icon: FileText },
  { label: 'Submissions', href: '/console/submissions', Icon: ClipboardList },
  { label: 'Questions', href: '/console/questions', Icon: ListChecks },
  { label: 'Cohort', href: '/console/cohort', Icon: BarChart3 },
  { label: 'Delivery', href: '/console/delivery', Icon: Send },
  { label: 'Settings', href: '/console/settings', Icon: Settings },
]

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  // Optimistic highlight: as soon as a nav item is clicked we mark it active so
  // the UI responds instantly, even while the destination is still loading.
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  useEffect(() => {
    setNavigatingTo(null)
  }, [pathname])
  const activeHref = navigatingTo ?? pathname

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={onClose}
        />
      )}

      <nav
        className={`fixed md:relative w-64 h-screen bg-grad-hero shadow-hero flex flex-col z-50 transform transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-7 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img src="/logo-white.png" alt="KnowMind Universe" className="h-8 w-auto" />
            <h2 className="text-2xl font-bold text-white font-display tracking-tight">
              KnowMind
            </h2>
          </div>
          <p className="text-xs text-purple-200 mt-2 tracking-wide uppercase">
            Operations Console
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeHref === item.href
              const isPending = navigatingTo === item.href && pathname !== item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch
                    onClick={() => {
                      setNavigatingTo(item.href)
                      onClose()
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group relative flex items-center gap-3 pl-5 pr-4 py-3 rounded-lg transition-colors min-h-[44px] text-[15px] ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-purple-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-grad-accent" />
                    )}
                    <item.Icon
                      className="h-5 w-5 shrink-0"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                    {isPending && (
                      <span className="ml-auto h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="p-4 border-t border-white/10">
          <a
            href="/landing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-purple-100 hover:bg-white/10 hover:text-white transition-colors text-sm min-h-[44px]"
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Landing Page</span>
          </a>
        </div>
      </nav>
    </>
  )
}
