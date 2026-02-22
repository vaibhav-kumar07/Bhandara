'use client'
import React, { useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import Button from '@/app/components/shared/Button'
import { BhandaraSpendingResponse } from '@/lib/bhandara-spending/bhandara-spending.types'

interface DeleteSpendingModalProps {
  bhandaraSpending: BhandaraSpendingResponse
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export default function DeleteSpendingModal({
  bhandaraSpending,
  onClose,
  onConfirm,
  isDeleting
}: DeleteSpendingModalProps) {

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, isDeleting])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Delete Spending</h2>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          {!isDeleting && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-3">
              Are you sure you want to delete this spending record?
            </p>

            {/* Spending Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {bhandaraSpending.spendingItem.name}
                  </p>
                  {bhandaraSpending.spendingItem.description && (
                    <p className="text-sm text-gray-600">
                      {bhandaraSpending.spendingItem.description}
                    </p>
                  )}
                </div>
                <div className="text-right flex items-center gap-2">
                  <p className="text-lg font-bold text-red-600">
                    -{formatCurrency(bhandaraSpending.amount)}
                  </p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${bhandaraSpending.paymentMode === 'cash'
                    ? 'bg-yellow-100 text-yellow-800'
                    : bhandaraSpending.paymentMode === 'upi'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                    }`}>
                    {bhandaraSpending.paymentMode === 'cash' ? 'Cash' :
                      bhandaraSpending.paymentMode === 'upi' ? 'UPI' : 'Bank'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              isLoading={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Delete Spending
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}