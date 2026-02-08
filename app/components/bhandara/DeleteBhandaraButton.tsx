'use client'
import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import DeleteBhandaraModal from './DeleteBhandaraModal'

interface DeleteBhandaraButtonProps {
  bhandaraId: string
  bhandaraName: string
  donationCount: number
}

export default function DeleteBhandaraButton({
  bhandaraId,
  bhandaraName,
  donationCount
}: DeleteBhandaraButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={donationCount > 0}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        title={donationCount > 0 ? 'Cannot delete bhandara with donations' : 'Delete bhandara'}
        type="button"
      >
        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-sm sm:text-base hidden sm:block">Delete</span>
      </button>

      {isModalOpen && (
        <DeleteBhandaraModal
          bhandaraId={bhandaraId}
          bhandaraName={bhandaraName}
          donationCount={donationCount}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}

