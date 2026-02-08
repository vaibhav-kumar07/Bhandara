'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import Button from '@/app/components/shared/Button'
import { createDonation, updateDonation } from '@/actions/Donation'
import { PAYMENT_MODE, PAYMENT_STATUS } from '@/lib/shared/constants'
import { DonationResponse } from '@/lib/donation/donation.types'
import { DonorResponse } from '@/lib/donor/donor.types'
import { toastSuccess, toastError } from '@/app/lib/utils/toast'

interface DonationModalProps {
  donation?: DonationResponse
  donor?: DonorResponse
  onClose: () => void
  mode: 'add' | 'update'
  bhandaraId: string
}

export default function DonationModal({ donation, donor, onClose, mode, bhandaraId }: DonationModalProps) {
  const router = useRouter()
  // In update mode, use donation data; in add mode, use donor prop
  const currentDonor = donation?.donor || donor

  const [formData, setFormData] = useState({
    amount: donation?.amount || '',
    paymentMode: donation?.paymentMode || PAYMENT_MODE.CASH,
    note: donation?.note || ''
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
        if (!currentDonor?.id) {
          toastError('Donor information is required')
          setIsSubmitting(false)
          return
        }
        result = await createDonation({
          donorId: currentDonor.id,
          bhandaraId: bhandaraId,
          amount,
          paymentMode: formData.paymentMode as typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI
        })
      } else {
        // Validate note in update mode (mandatory)
        if (!formData.note || formData.note.trim() === '') {
          toastError('Note is required when updating a donation')
          setIsSubmitting(false)
          return
        }
        result = await updateDonation({
          donationId: donation?.id as string,
          amount,
          paymentMode: formData.paymentMode as typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI,
          note: formData.note.trim()
        })
      }

      if (result.success) {
        toastSuccess(mode === 'add' ? 'Donation added successfully!' : 'Donation updated successfully!')
        setTimeout(() => {
          onClose()
          router.refresh()
        }, 500)
      } else {
        toastError(result.message || `Failed to ${mode === 'add' ? 'add' : 'update'} donation`)
      }
    } catch (error) {
      console.error('Error creating donation:', error)
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent bg-opacity-100 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 sm:py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              {mode === 'add' ? 'Add Donation' : 'Update Donation'}
            </h2>
            {currentDonor && (
              <p className=" capitalize text-xs sm:text-sm text-gray-600">
                {currentDonor.donorName}{currentDonor.fatherName ? ` / ${currentDonor.fatherName}` : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 py-2 sm:px-4 sm:py-4 space-y-2 sm:space-y-4">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-2 py-1.5 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
              placeholder="Enter amount"
              autoFocus
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Payment Mode
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setFormData(prev => ({ ...prev, paymentMode: PAYMENT_MODE.CASH }))
                }}
                className={`flex-1 px-2  sm:px-4 sm:py-2.5 rounded-md font-medium text-xs sm:text-sm transition-colors duration-200 ${formData.paymentMode === PAYMENT_MODE.CASH
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
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
                className={`flex-1 px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-md font-medium text-xs sm:text-sm transition-colors duration-200 ${formData.paymentMode === PAYMENT_MODE.UPI
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
              >
                Online
              </button>
            </div>
          </div>

          {/* Note - Required in update mode */}
          {mode === 'update' && (
            <div>
              <label htmlFor="note" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Note <span className="text-red-500">*</span>
              </label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                required
                rows={1}
                className="w-full px-2 py-1.5 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base resize-none placeholder:text-xs sm:placeholder:text-sm"
                placeholder="Enter a note about this donation update..."
              />
              <p className="text-xs sm:text-sm text-red-500 pl-1">Note is required when updating a donation</p>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 sm:pt-4">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full text-xs sm:text-sm"
            >
              {mode === 'update' ? 'Update Donation' : 'Add Donation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

