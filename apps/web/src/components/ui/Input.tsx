import { InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'w-full h-11 px-3.5 rounded-md bg-white border border-ink-200',
        'text-[14px] text-ink-700 placeholder:text-ink-400 outline-none transition-all duration-150',
        'focus:border-purple-400 focus:ring-4 focus:ring-purple-50',
        className
      )}
      {...props}
    />
  )
}
