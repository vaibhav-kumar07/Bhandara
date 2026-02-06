import Link from 'next/link'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import LogoutButton from './LogoutButton'
import MobileNavigation from './MobileNavigation'
import { ReactNode } from 'react'

async function Navigation(): Promise<ReactNode> {
  const admin = await getCurrentAdmin()
  
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-4 items-center">
        {admin ? (
          <>
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-semibold">{admin.username}</span>
            </span>
            <Link 
              href="/admin/Dashboard" 
              className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/donors" 
              className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Donors
            </Link>
            <LogoutButton />
          </>
        ) : (
          <Link 
            href="/admin/login" 
            className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow"
          >
            Login
          </Link>
        )}
      </nav>

      {/* Mobile Navigation */}
      <MobileNavigation admin={admin} />
    </>
  )
}

export default Navigation

