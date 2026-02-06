'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import DonationModal from '../bhandara/DonationModal'
import { DonationResponse } from '@/lib/donation/donation.types'
import { Lock } from 'lucide-react'

interface DonationCardProps {
  donation: DonationResponse
  bhandaraId: string
}

export default function DonationCard({ donation, bhandaraId }: DonationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const isLocked = donation.bhandara.isLocked || false

  const handleSuccess = () => {
    router.refresh()
  }

  const handleClick = () => {
    if (!isLocked) {
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <div
        onClick={handleClick}
        className={`
          bg-white rounded-lg border p-2.5 sm:p-3 transition
          ${isLocked 
            ? 'cursor-not-allowed opacity-60 border-gray-200' 
            : 'hover:border-blue-300 hover:shadow-sm cursor-pointer border-gray-200'}
        `}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Bhandara Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {donation.bhandara.name}
              </h3>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {new Date(donation.bhandara.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
          
          {/* Right: Amount and Mode */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
              ₹{donation.amount.toLocaleString('en-IN')}
            </span>
            <span
              className={`
                text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap
                ${donation.paymentMode === 'cash'
                  ? 'bg-yellow-100 text-yellow-800'
                  : donation.paymentMode === 'upi'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'}
              `}
            >
              {donation.paymentMode === 'cash' ? 'Cash' : donation.paymentMode === 'upi' ? 'Online' : 'Bank'}
            </span>
            {isLocked && (
              <Lock className="w-4 h-4 text-red-500 shrink-0" />
            )}
          </div>
        </div>
      </div>

      {isModalOpen && !isLocked && (
        <DonationModal
          donation={donation}
          onClose={() => setIsModalOpen(false)}
          mode="update"
          bhandaraId={bhandaraId}
        />
      )}
    </>
  )
}

