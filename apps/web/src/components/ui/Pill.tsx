import { clsx } from 'clsx'

type Band = 'developing' | 'emerging' | 'strong' | 'pending'

const band: Record<Band, string> = {
  developing: 'bg-gold-100 text-gold-600',
  emerging: 'bg-purple-50 text-purple-600',
  strong: 'bg-success-soft text-success',
  pending: 'bg-info-soft text-info',
}

export function Pill({
  band: b,
  children,
}: {
  band: Band
  children: React.ReactNode
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full',
        band[b]
      )}
    >
      {children}
    </span>
  )
}
