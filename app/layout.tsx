import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Killshot — We\'ll Try to Kill Your Startup Idea',
  description: 'Submit your startup idea for a brutal $5 AI analysis. Kill Score, vulnerabilities, competitor threats, and more.',
  openGraph: {
    title: 'Killshot — We\'ll Try to Kill Your Startup Idea',
    description: 'Submit your startup idea for a brutal $5 AI analysis.',
    siteName: 'Killshot',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
