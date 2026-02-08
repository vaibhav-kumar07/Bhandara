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
  index: number
}

export default function DonorCard({
  donor,
  donation,
  bhandaraId,
  isLocked = false,
  index,
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
          rounded-md shadow-sm border bg-white
          px-3 py-2
          transition
          ${isLocked
            ? 'cursor-not-allowed opacity-60 border-gray-200'
            : 'active:scale-[0.98] cursor-pointer hover:border-blue-300 hover:shadow-md'}
        `}
      >
        <div className="flex items-center justify-between gap-3">

          {/* Names */}
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base font-semibold text-gray-900 truncate capitalize">
              {index}. {donor.donorName}
              {donor.fatherName && (
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  {' / '}{donor.fatherName}
                </span>
              )}
            </p>
          </div>

          {/* Amount + Mode or Add indicator */}
          {donation ? (
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex gap-1 items-end">
                <p className="text-sm sm:text-base font-bold text-gray-900">
                  ₹{donation.amount.toLocaleString('en-IN')}
                </p>
                <span
                  className={` text-xs sm:text-sm
                    mt-0.5 font-medium px-2 py-[2px] rounded-md
                    ${donation.paymentMode === 'cash'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'}`}
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
