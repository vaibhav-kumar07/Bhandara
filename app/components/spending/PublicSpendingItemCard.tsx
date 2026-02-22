'use client'
import React from 'react'
import { BhandaraSpendingResponse } from '@/lib/bhandara-spending/bhandara-spending.types'
import { SpendingItemResponse } from '@/lib/spending-item/spending-item.types'

interface PublicSpendingItemCardProps {
  spendingItem: SpendingItemResponse
  bhandaraSpending?: BhandaraSpendingResponse
  index: number
}

export default function PublicSpendingItemCard({
  spendingItem,
  bhandaraSpending,
  index,
}: PublicSpendingItemCardProps) {

  return (
    <div className="rounded-md shadow-sm border bg-white px-3 py-2 border-gray-200">
      <div className="flex items-center justify-between gap-3">

        {/* Names */}
        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate capitalize">
            {index}. {spendingItem.name}
          </p>
          {spendingItem.description && (
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {spendingItem.description}
            </p>
          )}
        </div>

        {/* Amount + Mode or No spending indicator */}
        {bhandaraSpending ? (
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex gap-1 items-end">
              <p className="text-sm sm:text-base font-bold text-red-600">
                -₹{bhandaraSpending.amount.toLocaleString('en-IN')}
              </p>
              <span
                className={`text-xs sm:text-sm
                  mt-0.5 font-medium px-2 py-[2px] rounded-md
                  ${bhandaraSpending.paymentMode === 'cash'
                    ? 'bg-yellow-100 text-yellow-800'
                    : bhandaraSpending.paymentMode === 'upi'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'}`}
              >
                {bhandaraSpending.paymentMode === 'cash' ? 'Cash' : 
                 bhandaraSpending.paymentMode === 'upi' ? 'UPI' : 'Bank'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-gray-500 px-2 py-1">
              No spending
            </span>
          </div>
        )}

      </div>
    </div>
  )
}