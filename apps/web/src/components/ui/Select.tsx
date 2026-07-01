import { SelectHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

// App-wide dropdown. Wraps a native <select> (keyboard + a11y intact) but hides
// the OS-default arrow (`appearance-none`) and draws a consistent chevron so
// every dropdown matches the design system regardless of browser/platform.
export function Select({
  className,
  wrapperClassName,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { wrapperClassName?: string }) {
  return (
    <div className={clsx('relative w-full', wrapperClassName)}>
      <select
        className={clsx(
          'w-full h-11 pl-3.5 pr-10 rounded-md bg-white border border-ink-200',
          'text-[14px] text-ink-700 outline-none transition-all duration-150 appearance-none cursor-pointer',
          'focus:border-purple-400 focus:ring-4 focus:ring-purple-50',
          'disabled:bg-ink-100 disabled:text-ink-400 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400"
        strokeWidth={2}
        aria-hidden="true"
      />
    </div>
  )
}
