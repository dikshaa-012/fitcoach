import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitCoach AI — Your AI-Powered Fitness Companion',
  description: 'Log workouts, track stats, and get AI-powered motivation',
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
