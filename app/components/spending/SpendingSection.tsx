'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SpendingItemCard from './SpendingItemCard'
import AddSpendingButton from './AddSpendingButton'
import UploadSpendingExcelButton from './UploadSpendingExcelButton'
import DeleteSpendingModal from './DeleteSpendingModal'
import { BhandaraSpendingResponse } from '@/lib/bhandara-spending/bhandara-spending.types'
import { SpendingItemResponse } from '@/lib/spending-item/spending-item.types'
import { deleteBhandaraSpending } from '@/actions/Spending'
import { toastSuccess, toastError } from '@/app/lib/utils/toast'

interface SpendingSectionProps {
  bhandaraSpendings: BhandaraSpendingResponse[]
  allSpendingItems: SpendingItemResponse[]
  bhandaraId: string
  isLocked: boolean
  showHeader?: boolean
  uploadButtonActive?: boolean
}

export default function SpendingSection({ bhandaraSpendings, allSpendingItems, bhandaraId, isLocked, showHeader = true, uploadButtonActive = false }: SpendingSectionProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [spendingToDelete, setSpendingToDelete] = useState<BhandaraSpendingResponse | null>(null)

  const handleDeleteClick = (bhandaraSpendingId: string) => {
    if (isDeleting) return
    
    const spending = bhandaraSpendings.find(s => s.id === bhandaraSpendingId)
    if (spending) {
      setSpendingToDelete(spending)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!spendingToDelete || isDeleting) return

    setIsDeleting(spendingToDelete.id)
    
    try {
      const result = await deleteBhandaraSpending(spendingToDelete.id)
      if (result.success) {
        toastSuccess('Spending deleted successfully!')
        setSpendingToDelete(null)
        router.refresh()
      } else {
        toastError(result.message || 'Failed to delete spending')
      }
    } catch (error) {
      console.error('Error deleting spending:', error)
      toastError('An unexpected error occurred')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setSpendingToDelete(null)
    }
  }

  // Create a map of bhandara spendings by spending item ID for quick lookup
  const bhandaraSpendingMap = new Map()
  bhandaraSpendings.forEach((bhandaraSpending) => {
    bhandaraSpendingMap.set(bhandaraSpending.spendingItem.id, bhandaraSpending)
  })

  return (
    <div>
      {showHeader && (
        <div className="w-full flex items-center justify-between flex-wrap gap-2.5 mb-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Spending</h3>
          {!isLocked && (
            <div className="flex flex-wrap gap-2.5 sm:w-auto w-full">
              {uploadButtonActive && (
                <div className="flex-1 sm:flex-initial">
                  <UploadSpendingExcelButton bhandaraId={bhandaraId} isLocked={isLocked} />
                </div>
              )}
              <div className="flex-1 sm:flex-initial">
                <AddSpendingButton bhandaraId={bhandaraId} />
              </div>
            </div>
          )}
        </div>
      )}
      {!allSpendingItems || allSpendingItems.length === 0 ? (
        <div className="bg-white rounded-md shadow-sm px-3 py-2 border border-gray-200 text-center">
          <p className="text-gray-600">No spending items available. Add spending items first.</p>
        </div>
      ) : (
        <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 pr-2">
          {allSpendingItems.map((spendingItem, index) => {
            const bhandaraSpending = bhandaraSpendingMap.get(spendingItem.id)
            return (
              <SpendingItemCard
                key={spendingItem.id}
                spendingItem={spendingItem}
                bhandaraSpending={bhandaraSpending}
                bhandaraId={bhandaraId}
                isLocked={isLocked || isDeleting === bhandaraSpending?.id}
                index={index + 1}
                onDelete={handleDeleteClick}
              />
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {spendingToDelete && (
        <DeleteSpendingModal
          bhandaraSpending={spendingToDelete}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting === spendingToDelete.id}
        />
      )}
    </div>
  )
}