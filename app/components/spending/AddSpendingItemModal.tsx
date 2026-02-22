'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import Button from '@/app/components/shared/Button'
import { createSpendingItemWithBhandaraSpending } from '@/actions/SpendingItem'
import { toastSuccess, toastError } from '@/app/lib/utils/toast'

interface AddSpendingItemModalProps {
  bhandaraId: string
  onClose: () => void
}

export default function AddSpendingItemModal({ bhandaraId, onClose }: AddSpendingItemModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    amount: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      // Validate amount
      const amount = parseFloat(formData.amount.toString())
      if (isNaN(amount) || amount <= 0) {
        toastError('Please enter a valid amount')
        setIsSubmitting(false)
        return
      }

      // Create both spending item and bhandara spending in one action
      const result = await createSpendingItemWithBhandaraSpending({
        name: formData.name.trim(),
        bhandaraId: bhandaraId,
        amount
      })

      if (result.success) {
        toastSuccess('Spending added successfully!')
        setTimeout(() => {
          onClose()
          router.refresh()
        }, 500)
      } else {
        toastError(result.message || 'Failed to add spending')
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
            <h2 className="text-xl font-bold text-gray-900">Add Spending</h2>
            <p className="text-sm text-gray-600 mt-1">Create spending item and add amount</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Spending Item Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-base"
              placeholder="e.g., Food, Decorations, Supplies"
              autoFocus
            />
          </div>

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
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-base"
              placeholder="Enter amount spent"
            />
          </div>


          {/* Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Add Spending
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}