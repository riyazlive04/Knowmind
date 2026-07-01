'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export interface Country {
  code: string // dial code, e.g. "+91"
  name: string
  flag: string
  iso: string // for stable keys (dial codes aren't unique)
}

// Common dial codes — searchable, so a longer list is fine.
export const COUNTRIES: Country[] = [
  { iso: 'IN', code: '+91', name: 'India', flag: '🇮🇳' },
  { iso: 'US', code: '+1', name: 'United States', flag: '🇺🇸' },
  { iso: 'CA', code: '+1', name: 'Canada', flag: '🇨🇦' },
  { iso: 'GB', code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { iso: 'AE', code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { iso: 'SG', code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { iso: 'AU', code: '+61', name: 'Australia', flag: '🇦🇺' },
  { iso: 'SA', code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { iso: 'QA', code: '+974', name: 'Qatar', flag: '🇶🇦' },
  { iso: 'KW', code: '+965', name: 'Kuwait', flag: '🇰🇼' },
  { iso: 'OM', code: '+968', name: 'Oman', flag: '🇴🇲' },
  { iso: 'BH', code: '+973', name: 'Bahrain', flag: '🇧🇭' },
  { iso: 'MY', code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { iso: 'PK', code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { iso: 'BD', code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { iso: 'LK', code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { iso: 'NP', code: '+977', name: 'Nepal', flag: '🇳🇵' },
  { iso: 'ID', code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { iso: 'PH', code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { iso: 'TH', code: '+66', name: 'Thailand', flag: '🇹🇭' },
  { iso: 'DE', code: '+49', name: 'Germany', flag: '🇩🇪' },
  { iso: 'FR', code: '+33', name: 'France', flag: '🇫🇷' },
  { iso: 'ES', code: '+34', name: 'Spain', flag: '🇪🇸' },
  { iso: 'IT', code: '+39', name: 'Italy', flag: '🇮🇹' },
  { iso: 'NL', code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { iso: 'JP', code: '+81', name: 'Japan', flag: '🇯🇵' },
  { iso: 'CN', code: '+86', name: 'China', flag: '🇨🇳' },
  { iso: 'ZA', code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { iso: 'NG', code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { iso: 'KE', code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { iso: 'BR', code: '+55', name: 'Brazil', flag: '🇧🇷' },
]

export default function CountryCodeSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (code: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected =
    COUNTRIES.find((c) => c.code === value) ?? COUNTRIES[0]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase().includes(q)
    )
  }, [query])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // Focus the search box when opening; reset query/active on close
  useEffect(() => {
    if (open) {
      setActiveIndex(0)
      const t = setTimeout(() => searchRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
    setQuery('')
  }, [open])

  function choose(code: string) {
    onChange(code)
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const pick = filtered[activeIndex]
      if (pick) choose(pick.code)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country code: ${selected.name} ${selected.code}`}
        className="flex h-11 items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 transition-all hover:border-purple-300 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span>{selected.code}</span>
        <svg
          className={`h-4 w-4 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 z-30 mt-2 w-72 overflow-hidden rounded-lg border border-ink-200 bg-white shadow-lg"
          role="listbox"
          onKeyDown={onKeyDown}
        >
          <div className="border-b border-ink-100 p-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              placeholder="Search country or code…"
              className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 placeholder:text-ink-400 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-center text-sm text-ink-400">
                No matches
              </li>
            )}
            {filtered.map((c, i) => {
              const isSelected = c.code === value && c.iso === selected.iso
              const isActive = i === activeIndex
              return (
                <li key={c.iso}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => choose(c.code)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                      isActive ? 'bg-purple-50' : 'bg-white'
                    }`}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="flex-1 text-ink-700">{c.name}</span>
                    <span className="text-ink-400">{c.code}</span>
                    {isSelected && (
                      <span className="text-purple-600" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
