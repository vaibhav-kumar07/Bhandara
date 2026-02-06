'use client'
import React, { useState } from 'react'
import { UserPlus, PlusCircle } from 'lucide-react'
import AddDonorModal from '../donors/AddDonorModal'
import CreateBhandaraModal from '../bhandara/CreateBhandaraModal'

interface AdminQuickActionsProps {
  admin: { username: string } | null
}

export default function AdminQuickActions({ admin }: AdminQuickActionsProps) {
  const [isAddDonorModalOpen, setIsAddDonorModalOpen] = useState(false)
  const [isCreateBhandaraModalOpen, setIsCreateBhandaraModalOpen] = useState(false)

  if (!admin) return null

  const handleDonorSuccess = () => {
    // Refresh the page to show the new donor
    window.location.reload()
  }

  return (
    <>
      <div className="flex flex-col items-center justify-between gap-2">
        <button
          onClick={() => setIsAddDonorModalOpen(true)}
          className="w-full h-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add Donor</span>
        </button>
        <button
          onClick={() => setIsCreateBhandaraModalOpen(true)}
          className="w-full h-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>New Bhandara</span>
        </button>
      </div>

      {isAddDonorModalOpen && (
        <AddDonorModal
          onClose={() => setIsAddDonorModalOpen(false)}
          onSuccess={handleDonorSuccess}
        />
      )}

      {isCreateBhandaraModalOpen && (
        <CreateBhandaraModal
          onClose={() => setIsCreateBhandaraModalOpen(false)}
        />
      )}
    </>
  )
}

