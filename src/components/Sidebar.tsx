'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Overview', href: '/console', icon: '📊' },
  { label: 'Members', href: '/console/members', icon: '👥' },
  { label: 'Records / Reports', href: '/console/reports', icon: '📄' },
  { label: 'Submissions', href: '/console/submissions', icon: '📝' },
  { label: 'Questions', href: '/console/questions', icon: '❓' },
  { label: 'Cohort', href: '/console/cohort', icon: '📈' },
  { label: 'Leads', href: '/console/leads', icon: '🎯' },
  { label: 'Delivery', href: '/console/delivery', icon: '📨' },
  { label: 'Settings', href: '/console/settings', icon: '⚙️' },
]

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={onClose}
        />
      )}

      <nav
        className={`fixed md:relative w-64 h-screen bg-surface border-r border-border flex flex-col z-50 transform transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-primary font-fraunces">
            KnowMind
          </h2>
          <p className="text-xs text-text-muted mt-1">Operations Console</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-primary text-primary-fg font-medium'
                        : 'text-text hover:bg-background'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="p-4 border-t border-border">
          <a
            href="/landing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-text hover:bg-background transition-colors text-sm"
          >
            <span>🔗</span>
            <span>Landing Page</span>
          </a>
        </div>
      </nav>
    </>
  )
}
