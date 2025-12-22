'use client'

import { Navbar } from '@/components/Navbar'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Add auth check and redirect to login if not authenticated

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-8">
        {children}
      </main>
    </div>
  )
}
