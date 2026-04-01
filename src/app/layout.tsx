import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ASPIREX 2026 - Cloud Security & Threat Detection System',
  description: 'Real-time threat detection, AI anomaly detection, and contextual security dashboard.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors">
        {children}
      </body>
    </html>
  )
}
