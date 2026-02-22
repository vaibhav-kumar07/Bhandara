'use client'
import { useState } from 'react'
import Button from '@/app/components/shared/Button'
import { Upload } from 'lucide-react'
import UploadSpendingExcelModal from './UploadSpendingExcelModal'

interface UploadSpendingExcelButtonProps {
  bhandaraId: string
  isLocked?: boolean
}

export default function UploadSpendingExcelButton({ bhandaraId, isLocked = false }: UploadSpendingExcelButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isLocked) {
    return null
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center gap-1.5 sm:gap-2 justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base"
      >
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Upload Spending</span>
        <span className="sm:hidden">Upload</span>
      </Button>
      {isModalOpen && (
        <UploadSpendingExcelModal
          bhandaraId={bhandaraId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}