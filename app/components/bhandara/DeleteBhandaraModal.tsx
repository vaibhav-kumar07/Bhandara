'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, AlertTriangle } from 'lucide-react'
import Button from '@/app/components/shared/Button'
import { deleteBhandara } from '@/actions/Bhandara'
import { toastSuccess, toastError } from '@/app/lib/utils/toast'

interface DeleteBhandaraModalProps {
  bhandaraId: string
  bhandaraName: string
  donationCount: number
  onClose: () => void
}

export default function DeleteBhandaraModal({ 
  bhandaraId, 
  bhandaraName,
  donationCount,
  onClose 
}: DeleteBhandaraModalProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (donationCount > 0) {
      toastError('Cannot delete bhandara. There are donations associated with this bhandara.')
      onClose()
      return
    }

    setIsDeleting(true)
    
    try {
      const result = await deleteBhandara({ id: bhandaraId })
      
      if (result.success) {
        toastSuccess('Bhandara deleted successfully!')
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        toastError(result.message || 'Failed to delete bhandara')
        setIsDeleting(false)
      }
    } catch (error) {
      console.error('Error deleting bhandara:', error)
      toastError('An unexpected error occurred')
      setIsDeleting(false)
    }
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Delete Bhandara
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Confirm deletion
            </p>
          </div>
          {!isDeleting && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5">
          {donationCount ==0 &&(
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Warning: This action cannot be undone
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Are you sure you want to delete <span className="font-semibold capitalize">"{bhandaraName}"</span>? 
                    This will permanently remove the bhandara from the system.
                  </p>
                </div>
              </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-2">
            {donationCount === 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              onClick={donationCount > 0 ? onClose : handleDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
              className={donationCount > 0 ? 'w-full' : 'flex-1'}
              variant={donationCount > 0 ? 'secondary' : 'danger'}
            >
              {donationCount > 0 
                ? 'Close' 
                : isDeleting 
                  ? 'Deleting...' 
                  : 'Delete Bhandara'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

