import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KnowMind - Emotional Intelligence Assessment',
  description: 'Assess and develop your emotional intelligence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
