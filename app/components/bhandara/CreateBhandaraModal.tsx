'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import Button from '@/app/components/shared/Button'
import { createBhandara } from '@/actions/Bhandara'
import { toastSuccess, toastError } from '@/app/lib/utils/toast'

interface CreateBhandaraModalProps {
  onClose: () => void
}

export default function CreateBhandaraModal({ onClose }: CreateBhandaraModalProps) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  
  // Generate a good default name with date
  const getDefaultName = () => {
    const date = new Date()
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December']
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `Bhandara ${month} ${year}`
  }
  
  const [formData, setFormData] = useState({
    name: getDefaultName(),
    date: today
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

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
      const result = await createBhandara({
        name: formData.name.trim(),
        date: formData.date
      })
      
      if (result.success && result.bhandaraId) {
        toastSuccess('Bhandara created successfully! Redirecting...')
        setIsSubmitting(false)
        setIsRedirecting(true)
        setTimeout(() => {
          router.push(`/admin/bhandara/${result.bhandaraId}`)
        }, 1000)
      } else {
        toastError(result.message || 'Failed to create bhandara')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error creating bhandara:', error)
      toastError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRedirecting) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, isRedirecting])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isRedirecting) {
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
              Create Bhandara
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Set up a new Bhandara event
            </p>
          </div>
          {!isRedirecting && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          className="p-4 sm:p-6 space-y-5"
        >
          {/* Bhandara Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
              disabled={isSubmitting || isRedirecting}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
              style={{ textTransform: 'uppercase' }}
              placeholder="Enter bhandara name"
              autoFocus
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={today}
              disabled={isSubmitting || isRedirecting}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Loading Message */}
          {isRedirecting && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                <span>Redirecting to bhandara details...</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2">
            <Button
              type="submit"
              isLoading={isSubmitting || isRedirecting}
              disabled={isRedirecting}
              className="w-full"
            >
              {isRedirecting ? 'Redirecting...' : 'Create Bhandara'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

