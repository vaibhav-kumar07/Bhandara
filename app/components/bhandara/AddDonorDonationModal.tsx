'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import Button from '@/app/components/shared/Button'
import { createDonor } from '@/actions/Donor'
import { createDonation } from '@/actions/Donation'
import { PAYMENT_MODE, PAYMENT_STATUS } from '@/lib/shared/constants'
import { toastSuccess, toastError } from '@/app/lib/utils/toast'

interface AddDonorDonationModalProps {
  bhandaraId: string
  onClose: () => void
}

export default function AddDonorDonationModal({ bhandaraId, onClose }: AddDonorDonationModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<'donor' | 'donation'>('donor')
  const [donorData, setDonorData] = useState({
    donorName: '',
    fatherName: ''
  })
  const [donationData, setDonationData] = useState<{
    amount: string
    paymentMode: typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI
  }>({
    amount: '',
    paymentMode: PAYMENT_MODE.CASH
  })
  const [donorId, setDonorId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDonorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDonorData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDonationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setDonationData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDonorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const result = await createDonor({
        donorName: donorData.donorName.trim(),
        fatherName: donorData.fatherName.trim() || undefined
      })
      
      if (result.success && result.donorId) {
        toastSuccess('Donor added successfully!')
        setDonorId(result.donorId)
        setStep('donation')
      } else {
        toastError(result.message || 'Failed to create donor')
      }
    } catch (error) {
      console.error('Error creating donor:', error)
      toastError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!donorId) {
      toastError('Donor ID is missing')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const amount = parseFloat(donationData.amount.toString())
      if (isNaN(amount) || amount <= 0) {
        toastError('Please enter a valid amount')
        setIsSubmitting(false)
        return
      }
      
      const result = await createDonation({
        donorId: donorId,
        bhandaraId: bhandaraId,
        amount,
        paymentMode: donationData.paymentMode as typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI
      })
      
      if (result.success) {
        toastSuccess('Donor and donation added successfully!')
        setTimeout(() => {
          onClose()
          router.refresh()
        }, 500)
      } else {
        toastError(result.message || 'Failed to create donation')
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
              {step === 'donor' ? 'Add Donor' : 'Add Donation'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {step === 'donor' ? '1' : '2'} of 2
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
        <form 
          onSubmit={step === 'donor' ? handleDonorSubmit : handleDonationSubmit} 
          className="p-4 sm:p-6 space-y-5"
        >
          {step === 'donor' ? (
            <>
              {/* Donor Name */}
              <div>
                <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-2">
                  Donor Name
                </label>
                <input
                  type="text"
                  id="donorName"
                  name="donorName"
                  value={donorData.donorName}
                  onChange={handleDonorChange}
                  required
                  minLength={2}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  placeholder="Enter donor name"
                  autoFocus
                />
              </div>

              {/* Father Name */}
              <div>
                <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-2">
                  Father Name <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  id="fatherName"
                  name="fatherName"
                  value={donorData.fatherName}
                  onChange={handleDonorChange}
                  minLength={2}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  placeholder="Enter father name (optional)"
                />
              </div>
            </>
          ) : (
            <>
              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={donationData.amount}
                  onChange={handleDonationChange}
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
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
                      setDonationData(prev => ({ ...prev, paymentMode: PAYMENT_MODE.CASH }))
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-colors duration-200 ${
                      donationData.paymentMode === PAYMENT_MODE.CASH
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
                      setDonationData(prev => ({ ...prev, paymentMode: PAYMENT_MODE.UPI }))
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-colors duration-200 ${
                      donationData.paymentMode === PAYMENT_MODE.UPI
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Online
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-2">
            {step === 'donation' && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep('donor')}
                disabled={isSubmitting}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              isLoading={isSubmitting}
              className={step === 'donation' ? 'flex-1' : 'w-full'}
            >
              {step === 'donor' ? 'Next' : 'Add Donation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

