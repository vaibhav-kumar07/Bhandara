'use client'
import { useState } from "react"
import Button from "../shared/Button"
import { Minus } from "lucide-react"
import AddSpendingItemModal from "./AddSpendingItemModal"

interface AddSpendingButtonProps {
  bhandaraId: string
}

export default function AddSpendingButton({ bhandaraId }: AddSpendingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="secondary"
        className="w-full flex items-center gap-1.5 sm:gap-2 justify-center ml-auto px-2 py-1.5 sm:px-4 sm:py-2.5 text-sm sm:text-base bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
      >
        <Minus className="w-4 h-4" />
        <span className=" ">Add Spending</span>
      </Button>
      {isModalOpen && (
        <AddSpendingItemModal
          bhandaraId={bhandaraId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}