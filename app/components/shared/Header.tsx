import Link from 'next/link'
import Navigation from './Navigation'
import { Suspense } from 'react'
import { Sparkles } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white h-16 fixed top-0 left-0 right-0 z-50 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">
              Bhandara Donations
            </h1>
          </Link>
          <Suspense fallback={<div className="w-20 h-8"></div>}>
            {/* @ts-expect-error Async Server Component */}
            <Navigation />
          </Suspense>
        </div>
      </div>
    </header>
  )
}