'use client'
import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { DonorResponse } from '@/lib/donor/donor.types'
import { DonationResponse } from '@/lib/donation/donation.types'

interface DonorDonationsModalProps {
  donor: DonorResponse
  donations: DonationResponse[]
  onClose: () => void
}

export default function DonorDonationsModal({ donor, donations, onClose }: DonorDonationsModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate capitalize">
              {donor.donorName}{donor.fatherName ? ` / ${donor.fatherName}` : ''}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              {donations.length} {donations.length === 1 ? 'donation' : 'donations'} total
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Donations List */}
        <div className="p-2 sm:p-4 overflow-y-auto flex-1 hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none]">
          {donations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No donations found for this donor.</p>
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="border border-gray-200 rounded-md p-2 sm:p-3 hover:border-blue-300 hover:shadow-sm transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3">
                    {/* Bhandara Name - Compact */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate capitalize">
                        {donation.bhandara.name}
                      </h3>
                    </div>

                    {/* Date, Amount, Mode - Compact Row */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      {/* Date */}
                      <span className="text-gray-600 whitespace-nowrap">
                        {new Date(donation.bhandara.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>

                      {/* Amount */}
                      <span className="font-bold text-gray-900 whitespace-nowrap">
                        ₹{donation.amount.toLocaleString('en-IN')}
                      </span>

                      {/* Payment Mode Badge */}
                      <span
                        className={`
                          text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded whitespace-nowrap
                          ${donation.paymentMode === 'cash'
                            ? 'bg-yellow-100 text-yellow-800'
                            : donation.paymentMode === 'upi'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'}
                        `}
                      >
                        {donation.paymentMode === 'cash' ? 'Cash' : donation.paymentMode === 'upi' ? 'Online' : 'Bank'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

