'use client'
import React, { useState } from 'react'
import { UserPlus, Calendar } from 'lucide-react'
import AddDonorModal from '@/app/components/donors/AddDonorModal'
import CreateBhandaraModal from '@/app/components/bhandara/CreateBhandaraModal'

export default function DashboardPage() {
  const [isAddDonorModalOpen, setIsAddDonorModalOpen] = useState(false)
  const [isCreateBhandaraModalOpen, setIsCreateBhandaraModalOpen] = useState(false)

  const handleDonorSuccess = () => {
    // Refresh the page to show the new donor
    window.location.reload()
  }

  return (
    <>
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your Bhandara events and donors
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Add Donor Button */}
            <button
              onClick={() => setIsAddDonorModalOpen(true)}
              className="group block text-left w-full"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 hover:border-blue-200 h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      Add Donor
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Register a new donor to the system
                    </p>
                  </div>
                  <div className="flex items-center text-blue-600 font-semibold text-sm sm:text-base group-hover:text-blue-700">
                    <span>Get Started</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Create Bhandara Button */}
            <button
              onClick={() => setIsCreateBhandaraModalOpen(true)}
              className="group block text-left w-full"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 hover:border-green-200 h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      Create Bhandara
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Set up a new Bhandara event
                    </p>
                  </div>
                  <div className="flex items-center text-green-600 font-semibold text-sm sm:text-base group-hover:text-green-700">
                    <span>Get Started</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
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