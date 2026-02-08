'use client'
import { useState } from "react"
import Button from "../shared/Button"
import { Plus } from "lucide-react"
import AddDonorDonationModal from "./AddDonorDonationModal"

interface AddDonorDonationProps {
  bhandaraId: string
}

export default function AddDonorDonation({ bhandaraId }: AddDonorDonationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center gap-1.5 sm:gap-2 justify-center ml-auto px-2 py-1.5 sm:px-4 sm:py-2.5 text-sm sm:text-base"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Donor & Donation</span>
        <span className="sm:hidden ">Add</span>
      </Button>
      {isModalOpen && (
        <AddDonorDonationModal
          bhandaraId={bhandaraId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}

