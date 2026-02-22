'use client'
import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Button from '@/app/components/shared/Button'
import { updateBhandara } from '@/actions/Bhandara'
import { toastSuccess, toastError } from '@/app/lib/utils/toast'

interface EditBhandaraModalProps {
  bhandara: {
    id: string
    name: string
    date: string
    description?: string
  }
  onClose: () => void
  onSuccess?: () => void
}

export default function EditBhandaraModal({ bhandara, onClose, onSuccess }: EditBhandaraModalProps) {
  const [formData, setFormData] = useState({
    name: bhandara.name,
    date: bhandara.date,
    description: bhandara.description || ''
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
      const result = await updateBhandara({
        id: bhandara.id,
        name: formData.name.trim(),
        date: formData.date,
        description: formData.description.trim() || undefined
      })

      if (result.success) {
        toastSuccess('Bhandara updated successfully!')
        if (onSuccess) {
          onSuccess()
        }
        onClose()
      } else {
        toastError(result.message || 'Failed to update bhandara')
      }
    } catch (error) {
      console.error('Error updating bhandara:', error)
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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-4 py-2 sm:py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Edit Bhandara
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Update bhandara information
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
          onSubmit={handleSubmit}
          className="px-4 py-2 sm:px-4 sm:py-4 space-y-2 sm:space-y-4"
        >
          {/* Bhandara Name */}
          <div>
            <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Bhandara Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={3}
              disabled={isSubmitting}
              className="w-full px-2 py-1.5 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter bhandara name"
              autoFocus
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-2 py-1.5 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={4}
              className="w-full text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all  disabled:bg-gray-100 disabled:cursor-not-allowed resize-none placeholder:text-gray-500 placeholder:text-sm"
              placeholder="Enter a brief description for this bhandara (optional)"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 sm:pt-4">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full text-xs sm:text-sm"
            >
              Update Bhandara
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

