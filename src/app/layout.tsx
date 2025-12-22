import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Qalam - Learn Quran Translation',
    template: '%s | Qalam',
  },
  description: 'Practice and improve your understanding of Quran translations through interactive learning with AI-powered feedback.',
  keywords: ['Quran', 'translation', 'learning', 'Arabic', 'Islamic education'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
