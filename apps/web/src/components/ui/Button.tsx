import { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'purple' | 'secondary' | 'ghost' | 'danger'

const styles: Record<Variant, string> = {
  primary: 'bg-gold-400 text-purple-900 shadow-sm hover:bg-gold-300',
  purple: 'bg-purple-800 text-white hover:bg-purple-700',
  secondary: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
  ghost: 'bg-transparent text-purple-600 hover:bg-purple-50',
  danger: 'bg-danger text-white hover:opacity-90',
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-sans font-semibold text-[15px]',
        'h-11 px-5 rounded-md transition-all duration-150 active:scale-[0.97]',
        'disabled:bg-ink-200 disabled:text-ink-400 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100',
        styles[variant],
        className
      )}
      {...props}
    />
  )
}
