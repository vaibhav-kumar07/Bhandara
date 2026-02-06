'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Users,
  BarChart3,
  Banknote,
  CreditCard,
  Wallet,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react'

interface BhandaraCardProps {
  bhandara: {
    id: string
    name: string
    date: string
    totalCollected?: number
    totalPending?: number
    donorCount?: number
    totalDonations?: number
    paymentModeBreakdown?: {
      cash?: number
      upi?: number
      bank?: number
    }
  }
  isAdmin?: boolean
}

export default function BhandaraCard({ bhandara, isAdmin = false }: BhandaraCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const totalAmount =
    (bhandara.totalCollected || 0) + (bhandara.totalPending || 0)

  const { cash = 0, upi = 0, bank = 0 } =
    bhandara.paymentModeBreakdown || {}

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-300">
      {/* Always Visible Header - Name (Left) & Total (Right) */}
        <div className="flex items-center justify-between gap-3 p-3 sm:p-4" onClick={toggleExpand}>
          {/* Left: Bhandara Name */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
              {bhandara.name}
            </h3>
             {/* Date */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              {new Date(bhandara.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          </div>
          
          {/* Right: Total Collection */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm sm:text-base font-bold text-green-600">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
            <Link href={` ${isAdmin ? '/admin' : ''}/bhandara/${bhandara.id}`} className=" h-6 w-6 flex items-center justify-center hover:text-blue-600 transition-colors border-2 border-gray-200 rounded-full p-1">  
<ArrowRight className="h-3 w-3 text-gray-500" />
            </Link>
          </div>
        </div>  

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100 pt-3 space-y-3 ">
         

          {/* Stats - Horizontal Layout */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
              <Users className="h-4 w-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-[10px] text-blue-600 font-medium">Donors</p>
                <p className="text-sm font-bold text-blue-900">{bhandara.donorCount || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 rounded-lg border border-purple-100">
              <BarChart3 className="h-4 w-4 text-purple-600 shrink-0" />
              <div>
                <p className="text-[10px] text-purple-600 font-medium">Donations</p>
                <p className="text-sm font-bold text-purple-900">{bhandara.totalDonations || 0}</p>
              </div>
            </div>
          </div>

          {/* Payment Breakdown - Horizontal */}
          {(cash > 0 || upi > 0 || bank > 0) && (
            <div className="grid grid-cols-2 gap-2">
              {cash > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Banknote className="h-4 w-4 text-yellow-700 shrink-0" />
                  <div>
                    <p className="text-[10px] text-yellow-700 font-medium">Cash</p>
                    <p className="text-sm font-bold text-yellow-900">
                      ₹{cash.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}
              {upi > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 rounded-lg border border-green-200">
                  <CreditCard className="h-4 w-4 text-green-700 shrink-0" />
                  <div>
                    <p className="text-[10px] text-green-700 font-medium">Online</p>
                    <p className="text-sm font-bold text-green-900">
                      ₹{upi.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}
              {bank > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                  <Wallet className="h-4 w-4 text-blue-700 shrink-0" />
                  <div>
                    <p className="text-[10px] text-blue-700 font-medium">Bank</p>
                    <p className="text-sm font-bold text-blue-900">
                      ₹{bank.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

