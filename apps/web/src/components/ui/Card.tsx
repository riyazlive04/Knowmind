import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

type Tone = 'base' | 'hero' | 'lavender' | 'accent'

const tone: Record<Tone, string> = {
  base: 'bg-white shadow-sm rounded-xl',
  hero: 'bg-grad-hero text-white shadow-hero rounded-2xl',
  lavender: 'bg-grad-lavender shadow-md rounded-2xl',
  accent: 'bg-grad-accent text-purple-900 shadow-md rounded-2xl',
}

export function Card({
  tone: t = 'base',
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return <div className={clsx('p-6', tone[t], className)} {...props} />
}
