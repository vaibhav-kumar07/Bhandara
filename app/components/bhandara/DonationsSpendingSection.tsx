'use client'
import { useState } from 'react'
import DonorCard from './DonorCard'
import AddDonorDonation from './AddDonorDonation'
import UploadExcelButton from './UploadExcelButton'
import SpendingSection from '../spending/SpendingSection'
import AddSpendingButton from '../spending/AddSpendingButton'
import { DonationResponse } from '@/lib/donation/donation.types'
import { DonorResponse } from '@/lib/donor/donor.types'
import { BhandaraSpendingResponse } from '@/lib/bhandara-spending/bhandara-spending.types'
import { SpendingItemResponse } from '@/lib/spending-item/spending-item.types'

interface DonationsSpendingSectionProps {
  bhandara: {
    id: string
    name: string
    date: string
    isLocked: boolean
  }
  donations: DonationResponse[]
  allDonors: DonorResponse[]
  donationMap: Map<string, DonationResponse>
  bhandaraSpendings: BhandaraSpendingResponse[]
  allSpendingItems: SpendingItemResponse[]
  uploadbuttonActive: boolean
}

export default function DonationsSpendingSection({
  bhandara,
  donations,
  allDonors,
  donationMap,
  bhandaraSpendings,
  allSpendingItems,
  uploadbuttonActive
}: DonationsSpendingSectionProps) {
  const [activeTab, setActiveTab] = useState<'donations' | 'spending'>('donations')

  return (
    <div className='w-full'>
      {/* Tab Navigation */}
      <div className="w-full flex items-center justify-between flex-wrap gap-3 mb-3 ">
        <div className="w-full grid grid-cols-2 gap-3 bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('donations')}
            className={`w-fullpx-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'donations'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Donations
          </button>
          <button
            onClick={() => setActiveTab('spending')}
            className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'spending'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Spending
          </button>
        </div>

        {/* Action Buttons */}
        {!bhandara.isLocked && (
          <div className="flex flex-wrap gap-2.5 sm:w-auto w-full">
            {activeTab === 'donations' ? (
              <>
                {uploadbuttonActive && (
                  <div className="flex-1 sm:flex-initial">
                    <UploadExcelButton bhandaraId={bhandara.id} isLocked={bhandara.isLocked || false} />
                  </div>
                )}
                <div className="flex-1 sm:flex-initial">
                  <AddDonorDonation bhandaraId={bhandara.id} />
                </div>
              </>
            ) : (
              <div className="flex-1 sm:flex-initial">
                <AddSpendingButton bhandaraId={bhandara.id} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'donations' ? (
        /* Donations Content */
        <div>
          {!allDonors || allDonors.length === 0 ? (
            <div className="bg-white rounded-md shadow-sm px-3 py-2 border border-gray-200 text-center">
              <p className="text-gray-600">No donors available. Add donors from the dashboard.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 py-2.5 sm:gap-3 pr-2">
              {allDonors.map((donor, index) => {
                const donation = donationMap.get(donor.id)
                return (
                  <DonorCard
                    key={donor.id}
                    donor={donor}
                    donation={donation}
                    bhandaraId={bhandara.id}
                    isLocked={bhandara.isLocked || false}
                    index={index + 1}
                  />
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Spending Content */
        <SpendingSection
          bhandaraSpendings={bhandaraSpendings}
          allSpendingItems={allSpendingItems}
          bhandaraId={bhandara.id}
          isLocked={bhandara.isLocked || false}
          showHeader={false}
        />
      )}
    </div>
  )
}