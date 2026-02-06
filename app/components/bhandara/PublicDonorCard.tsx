'use client'
import React from 'react'
import Link from 'next/link'
import { DonationResponse } from '@/lib/donation/donation.types'
import { DonorResponse } from '@/lib/donor/donor.types'

interface PublicDonorCardProps {
  donor: DonorResponse
  donation?: DonationResponse
}

export default function PublicDonorCard({
  donor,
  donation,
}: PublicDonorCardProps) {
  return (
    <Link
      href={`/donor/${donor.id}`}
      className="rounded-lg border bg-white px-3 py-2 hover:border-blue-300 hover:shadow-sm transition cursor-pointer block"
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

        {/* Amount + Mode or No donation indicator */}
        {donation ? (
          <div className="flex flex-col items-end shrink-0">
            <p className="text-base font-bold text-gray-900">
              ₹{donation.amount.toLocaleString('en-IN')}
            </p>
            <span
              className={`
                mt-0.5 text-xs font-medium px-2 py-[2px] rounded-md
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
        ) : (
          <div className="flex flex-col items-end shrink-0">
            <span className="text-xs font-medium text-gray-500 px-2 py-1">
              No donation
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

