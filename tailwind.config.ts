import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-fg)',
          hover: 'var(--primary-hover)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-fg)',
          hover: 'var(--secondary-hover)',
        },
      },
      fontFamily: {
        fraunces: 'var(--font-fraunces)',
        inter: 'var(--font-inter)',
      },
      backgroundColor: {
        base: 'var(--bg)',
      },
      textColor: {
        base: 'var(--text)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
export default config
