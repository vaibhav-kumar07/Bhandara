'use client'
import React, { useState } from 'react'
import DonationModal from './DonationModal'
import { DonationResponse } from '@/lib/donation/donation.types'
import { DonorResponse } from '@/lib/donor/donor.types'
import { Lock } from 'lucide-react'

interface DonorCardProps {
  donor: DonorResponse
  donation?: DonationResponse
  bhandaraId: string
  isLocked?: boolean
}

export default function DonorCard({
  donor,
  donation,
  bhandaraId,
  isLocked = false,
}: DonorCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
          rounded-lg border bg-white
          px-3 py-2
          transition
          ${isLocked 
            ? 'cursor-not-allowed opacity-60 border-gray-200' 
            : 'active:scale-[0.98] cursor-pointer hover:border-blue-300 hover:shadow-sm'}
        `}
      >
        <div className="flex items-center justify-between gap-3">

          {/* Names */}
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-gray-900 truncate">
              {donor.donorName}
              <span className="text-gray-600 font-medium">
                {' / '}{donor.wifeName}
              </span>
            </p>
          </div>

          {/* Amount + Mode or Add indicator */}
          {donation ? (
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-end">
                <p className="text-base font-bold text-gray-900">
                  ₹{donation.amount.toLocaleString('en-IN')}
                </p>
                <span
                  className={`
                    mt-0.5 text-xs font-medium px-2 py-[2px] rounded-md
                    ${donation.paymentMode === 'cash'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'}
                  `}
                >
                  {donation.paymentMode === 'cash' ? 'Cash' : 'Online'}
                </span>
              </div>
              {isLocked && (
                <Lock className="w-4 h-4 text-red-500 shrink-0" />
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-gray-500 px-2 py-1">
                No donation
              </span>
              {isLocked && (
                <Lock className="w-4 h-4 text-red-500 shrink-0" />
              )}
            </div>
          )}

        </div>
      </div>

      {isModalOpen && !isLocked && (
        <DonationModal
          donation={donation}
          donor={donor}
          onClose={() => setIsModalOpen(false)}
          mode={donation ? 'update' : 'add'}
          bhandaraId={bhandaraId}
        />
      )}
    </>
  )
}
