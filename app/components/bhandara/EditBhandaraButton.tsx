'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2 } from 'lucide-react'
import EditBhandaraModal from './EditBhandaraModal'

interface EditBhandaraButtonProps {
  bhandara: {
    id: string
    name: string
    date: string
  }
}

export default function EditBhandaraButton({ bhandara }: EditBhandaraButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
        title="Edit bhandara"
        type="button"
      >
        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-sm sm:text-base hidden sm:block">Edit</span>
      </button>

      {isModalOpen && (
        <EditBhandaraModal
          bhandara={bhandara}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

