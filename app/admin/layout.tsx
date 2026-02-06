import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - Bhandara Donation System',
  description: 'Admin panel for managing Bhandara donations',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

