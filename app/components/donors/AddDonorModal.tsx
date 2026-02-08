'use client'
import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Button from '@/app/components/shared/Button'
import { createDonor, updateDonor } from '@/actions/Donor'
import { toastSuccess, toastError } from '@/app/lib/utils/toast'
import { DonorResponse } from '@/lib/donor/donor.types'

interface AddDonorModalProps {
  onClose: () => void
  onSuccess?: () => void
  mode?: 'add' | 'update'
  donor?: DonorResponse
}

export default function AddDonorModal({ onClose, onSuccess, mode = 'add', donor }: AddDonorModalProps) {
  const [formData, setFormData] = useState({
    donorName: donor?.donorName || '',
    fatherName: donor?.fatherName || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      let result
      if (mode === 'update' && donor) {
        result = await updateDonor({
          id: donor.id,
          donorName: formData.donorName.trim(),
          fatherName: formData.fatherName.trim() || undefined
        })
      } else {
        result = await createDonor({
          donorName: formData.donorName.trim(),
          fatherName: formData.fatherName.trim() || undefined
        })
      }

      if (result.success) {
        toastSuccess(mode === 'update' ? 'Donor updated successfully!' : 'Donor added successfully!')
        if (mode === 'add') {
          setFormData({ donorName: '', fatherName: '' })
        }
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          }
          onClose()
        }, 500)
      } else {
        toastError(result.message || `Failed to ${mode === 'update' ? 'update' : 'create'} donor`)
      }
    } catch (error) {
      console.error(`Error ${mode === 'update' ? 'updating' : 'creating'} donor:`, error)
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
        <div className="sticky top-0 bg-white  border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              {mode === 'update' ? 'Update Donor' : 'Add Donor'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {mode === 'update' ? 'Update donor information' : 'Register a new donor to the system'}
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
          {/* Donor Name */}
          <div>
            <label htmlFor="donorName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Donor Name
            </label>
            <input
              type="text"
              id="donorName"
              name="donorName"
              value={formData.donorName}
              onChange={handleChange}
              required
              minLength={2}
              className="w-full px-2 py-1.5 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
              placeholder="Enter donor name"
              autoFocus
            />
          </div>

          {/* Father Name */}
          <div>
            <label htmlFor="fatherName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Father Name <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              id="fatherName"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              minLength={2}
              className="w-full px-2 py-1.5 sm:px-4 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
              placeholder="Enter father name (optional)"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 sm:pt-4">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full text-xs sm:text-sm"
            >
              {mode === 'update' ? 'Update Donor' : 'Add Donor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

