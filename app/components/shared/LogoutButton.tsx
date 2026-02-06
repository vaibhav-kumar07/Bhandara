'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logoutAdmin } from '@/actions/Admin'

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const result = await logoutAdmin()
      if (result.success) {
        router.push('/')
        router.refresh() // Refresh to update the header
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  )
}
