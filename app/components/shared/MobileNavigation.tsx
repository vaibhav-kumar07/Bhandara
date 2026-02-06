'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import LogoutButton from './LogoutButton'

interface MobileNavigationProps {
  admin: { username: string } | null
}

export default function MobileNavigation({ admin }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 right-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col p-4 space-y-2">
          {admin ? (
            <>
              <div className="px-3 py-2 border-b border-gray-200 mb-2">
                <p className="text-sm text-gray-600">
                  Welcome, <span className="font-semibold text-gray-900">{admin.username}</span>
                </p>
              </div>
              <Link
                href="/admin/Dashboard"
                onClick={closeMenu}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/donors"
                onClick={closeMenu}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Donors
              </Link>
              <div className="pt-2 border-t border-gray-200">
                <LogoutButton />
              </div>
            </>
          ) : (
            <Link
              href="/admin/login"
              onClick={closeMenu}
              className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow text-center"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </>
  )
}

