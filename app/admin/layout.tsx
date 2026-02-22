import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - Bhandara Donation System',
  description: 'Admin panel for managing Bhandara donations',
}

// Force dynamic rendering for admin routes since they use cookies for auth
export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

