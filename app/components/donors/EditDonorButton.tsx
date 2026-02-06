'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2 } from 'lucide-react'
import AddDonorModal from './AddDonorModal'
import { DonorResponse } from '@/lib/donor/donor.types'

interface EditDonorButtonProps {
  donor: DonorResponse
}

export default function EditDonorButton({ donor }: EditDonorButtonProps) {
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
        title="Edit donor"
        type="button"
      >
        <Edit2 className="w-4 h-4" />
        <span>Edit</span>
      </button>

      {isModalOpen && (
        <AddDonorModal
          mode="update"
          donor={donor}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

