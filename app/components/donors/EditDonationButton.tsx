'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2 } from 'lucide-react'
import DonationModal from '../bhandara/DonationModal'
import { DonationResponse } from '@/lib/donation/donation.types'

interface EditDonationButtonProps {
  donation: DonationResponse
  bhandaraId: string
}

export default function EditDonationButton({ donation, bhandaraId }: EditDonationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
        title="Edit donation"
        type="button"
      >
        <Edit2 className="w-3 h-3" />
        <span className="hidden sm:inline">Edit</span>
      </button>

    </>
  )
}

