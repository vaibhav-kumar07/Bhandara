'use client'
import { useState } from 'react'
import PublicDonorCard from './PublicDonorCard'
import PublicSpendingItemCard from '../spending/PublicSpendingItemCard'
import { DonationResponse } from '@/lib/donation/donation.types'
import { DonorResponse } from '@/lib/donor/donor.types'
import { BhandaraSpendingResponse } from '@/lib/bhandara-spending/bhandara-spending.types'
import { SpendingItemResponse } from '@/lib/spending-item/spending-item.types'

interface PublicDonationsSpendingSectionProps {
  donations: DonationResponse[]
  allDonors: DonorResponse[]
  donationMap: Map<string, DonationResponse>
  bhandaraSpendings: BhandaraSpendingResponse[]
  allSpendingItems: SpendingItemResponse[]
  bhandaraSpendingMap: Map<string, BhandaraSpendingResponse>
}

export default function PublicDonationsSpendingSection({
  donations,
  allDonors,
  donationMap,
  bhandaraSpendings,
  allSpendingItems,
  bhandaraSpendingMap
}: PublicDonationsSpendingSectionProps) {
  const [activeTab, setActiveTab] = useState<'donations' | 'spending'>('donations')

  return (
    <div>
      {/* Tab Navigation */}
      <div className="w-full flex items-center justify-center flex-wrap gap-2.5 mb-3">
        <div className="w-full grid grid-cols-2 gap-3 bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'donations'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Donations
          </button>
          <button
            onClick={() => setActiveTab('spending')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'spending'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Spending
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'donations' ? (
        /* Donations Content */
        <div>
          {!allDonors || allDonors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <p className="text-gray-600">No donors available.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pr-2">
              {allDonors.map((donor, index) => {
                const donation = donationMap.get(donor.id)
                return (
                  <PublicDonorCard
                    index={index + 1}
                    key={donor.id}
                    donor={donor}
                    donation={donation}
                  />
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Spending Content */
        <div>
          {!allSpendingItems || allSpendingItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <p className="text-gray-600">No spending items available.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pr-2">
              {allSpendingItems.map((spendingItem, index) => {
                const bhandaraSpending = bhandaraSpendingMap.get(spendingItem.id)
                return (
                  <PublicSpendingItemCard
                    key={spendingItem.id}
                    spendingItem={spendingItem}
                    bhandaraSpending={bhandaraSpending}
                    index={index + 1}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}