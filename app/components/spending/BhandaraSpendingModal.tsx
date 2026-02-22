'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import Button from '@/app/components/shared/Button'
import { createBhandaraSpending, updateBhandaraSpending } from '@/actions/Spending'
import { PAYMENT_MODE } from '@/lib/shared/constants'
import { BhandaraSpendingResponse } from '@/lib/bhandara-spending/bhandara-spending.types'
import { SpendingItemResponse } from '@/lib/spending-item/spending-item.types'
import { toastSuccess, toastError } from '@/app/lib/utils/toast'

interface BhandaraSpendingModalProps {
  bhandaraSpending?: BhandaraSpendingResponse
  spendingItem?: SpendingItemResponse
  onClose: () => void
  mode: 'add' | 'update'
  bhandaraId: string
}

export default function BhandaraSpendingModal({ bhandaraSpending, spendingItem, onClose, mode, bhandaraId }: BhandaraSpendingModalProps) {
  const router = useRouter()
  // In update mode, use bhandaraSpending data; in add mode, use spendingItem prop
  const currentSpendingItem = bhandaraSpending?.spendingItem || spendingItem

  const [formData, setFormData] = useState({
    amount: bhandaraSpending?.amount || '',
    paymentMode: bhandaraSpending?.paymentMode || PAYMENT_MODE.CASH,
    note: bhandaraSpending?.note || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const amount = parseFloat(formData.amount.toString())
      if (isNaN(amount) || amount <= 0) {
        toastError('Please enter a valid amount')
        setIsSubmitting(false)
        return
      }

      let result: { success: boolean, message: string } | null = null
      if (mode === 'add') {
        if (!currentSpendingItem?.id) {
          toastError('Spending item information is required')
          setIsSubmitting(false)
          return
        }
        result = await createBhandaraSpending({
          spendingItemId: currentSpendingItem.id,
          bhandaraId: bhandaraId,
          amount,
          paymentMode: formData.paymentMode as typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI | typeof PAYMENT_MODE.BANK
        })
      } else {
        // Validate note in update mode (mandatory)
        if (!formData.note || formData.note.trim() === '') {
          toastError('Note is required when updating spending')
          setIsSubmitting(false)
          return
        }
        result = await updateBhandaraSpending({
          bhandaraSpendingId: bhandaraSpending?.id as string,
          amount,
          paymentMode: formData.paymentMode as typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI | typeof PAYMENT_MODE.BANK,
          note: formData.note.trim()
        })
      }

      if (result.success) {
        toastSuccess(mode === 'add' ? 'Spending added successfully!' : 'Spending updated successfully!')
        setTimeout(() => {
          onClose()
          router.refresh()
        }, 500)
      } else {
        toastError(result.message || `Failed to ${mode === 'add' ? 'add' : 'update'} spending`)
      }
    } catch (error) {
      console.error('Error creating spending:', error)
      toastError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'add' ? 'Add' : 'Edit'} Spending
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentSpendingItem?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="1"
              step="0.01"
              className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-base"
              placeholder="Enter amount"
              autoFocus
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Mode
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setFormData(prev => ({ ...prev, paymentMode: PAYMENT_MODE.CASH }))
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${formData.paymentMode === PAYMENT_MODE.CASH
                  ? 'bg-red-600 text-white shadow-md ring-2 ring-red-300'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
              >
                Cash
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setFormData(prev => ({ ...prev, paymentMode: PAYMENT_MODE.UPI }))
                }}
                className={`flex-1  px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${formData.paymentMode === PAYMENT_MODE.UPI
                  ? 'bg-red-600 text-white shadow-md ring-2 ring-red-300'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
              >
                UPI
              </button>
            </div>
          </div>

          {/* Note (mandatory for updates) */}
          {mode === 'update' && (
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                Update Note <span className="text-red-500">*</span>
              </label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                required
                minLength={5}
                rows={1}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-base resize-none placeholder:text-gray-500 placeholder:text-sm"
                placeholder="Reason for updating this spending (required)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Please provide a reason for this update (minimum 5 characters)
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 ">

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {mode === 'add' ? 'Add Spending' : 'Update Spending'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}