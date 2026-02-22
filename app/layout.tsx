import type { Metadata } from 'next'
import '@/styles/globals.css'
import Header from '@/app/components/shared/Header'
import AppInitializer from '@/app/components/shared/AppInitializer'
import { Suspense } from 'react'
import { Toaster } from '@/components/ui/sonner'
import NextTopLoader from 'nextjs-toploader'

export const metadata: Metadata = {
  title: 'Bhandara Donation System',
  description: 'Transparent donation tracking for Bhandara events',
  viewport: 'width=device-width, initial-scale=1',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="hide-scrollbar">
      <body className="hide-scrollbar">
        <NextTopLoader
          color="#f97316"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #f97316,0 0 5px #f97316"
        />
        <AppInitializer />
        <div className="w-full h-screen overflow-hidden hide-scrollbar">
          <Suspense fallback={<div>Loading...</div>}>
            <Header />
          </Suspense>
          <main className="w-full h-full flex-1 pt-16 overflow-y-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none]">
            {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  )
}