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
        purple: {
          50: '#F2ECF9',
          100: '#E2D8F0',
          200: '#C6B7E2',
          300: '#B795DA',
          400: '#9A6BC7',
          500: '#7B45B0',
          600: '#633394',
          700: '#4E2775',
          800: '#3B1C5A',
          900: '#2A1342',
        },
        gold: {
          100: '#FFF2D6',
          200: '#FFE3AD',
          300: '#FFD27A',
          400: '#FEB737',
          500: '#E6B44C',
          600: '#C9952F',
        },
        cream: '#F6F1E8',
        ink: {
          0: '#FFFFFF',
          50: '#FBF9F5',
          100: '#F1ECE3',
          200: '#E4DDD1',
          300: '#C9C1B5',
          400: '#9A9388',
          500: '#6E675D',
          700: '#403A33',
          900: '#231F1A',
        },
        success: '#3FA66A',
        'success-soft': '#E4F2EA',
        warning: '#E08A1E',
        'warning-soft': '#FCEFD9',
        danger: '#D1495B',
        'danger-soft': '#FAE5E8',
        // `error` aliases `danger` so legacy `text-error`/`bg-error` error-state
        // utilities resolve to the brand red (band displays still never use red).
        error: '#D1495B',
        'error-soft': '#FAE5E8',
        info: '#5468C9',
        'info-soft': '#E7EAF8',
      },
      fontFamily: {
        // `fraunces` kept as a legacy alias (now points at the modern display
        // font) so existing `font-fraunces` usages render correctly.
        fraunces: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        inter: 'var(--font-inter)',
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(43,19,66,.06)',
        sm: '0 2px 8px rgba(43,19,66,.06)',
        md: '0 8px 24px rgba(43,19,66,.08)',
        lg: '0 16px 40px rgba(43,19,66,.12)',
        hero: '0 18px 48px rgba(59,28,90,.28)',
      },
      backgroundImage: {
        'grad-hero':
          'linear-gradient(135deg,#4E2775 0%,#3B1C5A 60%,#2A1342 100%)',
        'grad-hero-soft': 'linear-gradient(135deg,#7B45B0 0%,#633394 100%)',
        'grad-accent': 'linear-gradient(135deg,#FEB737 0%,#E6B44C 100%)',
        'grad-lavender': 'linear-gradient(135deg,#E2D8F0 0%,#C6B7E2 100%)',
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
