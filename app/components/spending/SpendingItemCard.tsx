'use client'
import React, { useState } from 'react'
import BhandaraSpendingModal from './BhandaraSpendingModal'
import { BhandaraSpendingResponse } from '@/lib/bhandara-spending/bhandara-spending.types'
import { SpendingItemResponse } from '@/lib/spending-item/spending-item.types'
import { Lock, Trash2 } from 'lucide-react'

interface SpendingItemCardProps {
  spendingItem: SpendingItemResponse
  bhandaraSpending?: BhandaraSpendingResponse
  bhandaraId: string
  isLocked?: boolean
  index: number
  onDelete?: (bhandaraSpendingId: string) => void
}

export default function SpendingItemCard({
  spendingItem,
  bhandaraSpending,
  bhandaraId,
  isLocked = false,
  index,
  onDelete,
}: SpendingItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = () => {
    if (!isLocked) {
      setIsModalOpen(true)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLocked && onDelete && bhandaraSpending) {
      onDelete(bhandaraSpending.id)
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
            : 'active:scale-[0.98] cursor-pointer hover:border-red-300 hover:shadow-md'}
        `}
      >
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

          {/* Amount + Mode or Add indicator */}
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
              
              {!isLocked && onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Delete spending"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              {isLocked && (
                <Lock className="w-4 h-4 text-red-500 shrink-0" />
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-gray-500 px-2 py-1">
                No spending
              </span>
              {isLocked && (
                <Lock className="w-4 h-4 text-red-500 shrink-0" />
              )}
            </div>
          )}

        </div>
      </div>

      {isModalOpen && !isLocked && (
        <BhandaraSpendingModal
          bhandaraSpending={bhandaraSpending}
          spendingItem={spendingItem}
          onClose={() => setIsModalOpen(false)}
          mode={bhandaraSpending ? 'update' : 'add'}
          bhandaraId={bhandaraId}
        />
      )}
    </>
  )
}