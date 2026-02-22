import Link from 'next/link'
import Navigation from './Navigation'
import { Suspense } from 'react'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-white h-16 fixed top-0 left-0 right-0 z-50 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/bhandara-icon.png"
              alt="Bhandara"
              width={32}
              height={32}
              className="w-12 h-12 sm:w-14 sm:h-14"
              priority
            />
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