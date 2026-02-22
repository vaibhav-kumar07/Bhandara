import { getBhandaraDetails } from '@/actions/BhandaraDetail'
import DonorCard from '@/app/components/bhandara/DonorCard'
import AddDonorDonation from '@/app/components/bhandara/AddDonorDonation'
import UploadExcelButton from '@/app/components/bhandara/UploadExcelButton'
import EditBhandaraButton from '@/app/components/bhandara/EditBhandaraButton'
import DeleteBhandaraButton from '@/app/components/bhandara/DeleteBhandaraButton'
import DonationsSpendingSection from '../../../components/bhandara/DonationsSpendingSection'
import { Calendar, ArrowLeft, Lock, DollarSign, Users, CreditCard, Wallet, Building2, TrendingDown, Calculator } from 'lucide-react'
import Link from 'next/link'
import { getBhandaraStatsById } from '@/lib/stats/stats.service'
const uploadbuttonActive = process.env.UPLOAD_BUTTON_ACTIVE === 'true'

export default async function BhandaraDetailPage({ params }: { params: { id: string } }) {
  const result = await getBhandaraDetails(params.id)
  const bhandarastats = await getBhandaraStatsById(params.id)

  if (!result.success || !result.bhandara) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-red-600">Bhandara not found</p>
            <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { bhandara, donations, bhandaraSpendings, allDonors, allSpendingItems } = result

  // Create a map of donations by donor ID for quick lookup
  const donationMap = new Map()
  donations.forEach((donation) => {
    donationMap.set(donation.donor.id, donation)
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-3 sm:py-4">
      <div className="max-w-6xl mx-auto space-y-2 sm:space-y-4 bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="bg-white rounded-md shadow-sm px-3 py-2 border border-gray-200">
            <div className="flex items-center justify-between  flex-wrap gap-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <h1 className="capitalize text-base sm:text-lg font-bold text-gray-900 truncate">
                  {bhandara.name}
                </h1>
                {bhandara.isLocked && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded-md">
                    <Lock className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="text-xs font-medium text-red-700 whitespace-nowrap">Locked</span>
                  </div>
                )}
              </div>
              {!bhandara.isLocked && (
                <div className="shrink-0 flex items-center gap-2">
                  <EditBhandaraButton
                    bhandara={{
                      id: bhandara.id,
                      name: bhandara.name,
                      date: bhandara.date,
                      description: bhandara.description
                    }}
                  />
                  <DeleteBhandaraButton
                    bhandaraId={bhandara.id}
                    bhandaraName={bhandara.name}
                    donationCount={donations.length}
                  />
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 shrink-0" />
              {new Date(bhandara.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {bhandara.description && (
              <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">
                {bhandara.description}
              </p>
            )}
            {bhandara.isLocked && (
              <p className="text-xs sm:text-sm text-red-600 mt-2 font-medium">
                This bhandara is locked. Information cannot be changed after the event date.
              </p>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {bhandarastats && (
          <div className="bg-white ">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {/* Donor Count */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-md p-2 sm:p-3 border border-green-200">
                <div className="flex items-center gap-1 mb-1 sm:mb-2">
                  <Users className="w-3 h-3 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <span className="text-[10px] sm:text-sm font-medium text-green-900 leading-tight">Donor Count</span>
                </div>
                <p className="text-sm sm:text-xl font-bold text-green-900">
                  {bhandarastats.donorCount}
                </p>
              </div>

              {/* Total Collected */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-md p-2 sm:p-3 border border-blue-200">
                <div className="flex items-center gap-1 mb-1 sm:mb-2">
                  <DollarSign className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-[10px] sm:text-sm font-medium text-blue-900 leading-tight">Total Collected</span>
                </div>
                <p className="text-xs sm:text-xl font-bold text-blue-900 break-words">
                  {formatCurrency(bhandarastats.totalCollected)}
                </p>
              </div>

              {/* Total Spent */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-md p-2 sm:p-3 border border-red-200">
                <div className="flex items-center gap-1 mb-1 sm:mb-2">
                  <TrendingDown className="w-3 h-3 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                  <span className="text-[10px] sm:text-sm font-medium text-red-900 leading-tight">Total Spent</span>
                </div>
                <p className="text-xs sm:text-xl font-bold text-red-900 break-words">
                  {formatCurrency(bhandarastats.totalSpent)}
                </p>
              </div>

              {/* Net Balance */}
              <div className={`bg-gradient-to-br rounded-md p-2 sm:p-3 border ${bhandarastats.netBalance >= 0
                ? 'from-purple-50 to-purple-100 border-purple-200'
                : 'from-orange-50 to-orange-100 border-orange-200'
                }`}>
                <div className="flex items-center gap-1 mb-1 sm:mb-2">
                  <Calculator className={`w-3 h-3 sm:w-5 sm:h-5 flex-shrink-0 ${bhandarastats.netBalance >= 0 ? 'text-purple-600' : 'text-orange-600'
                    }`} />
                  <span className={`text-[10px] sm:text-sm font-medium leading-tight ${bhandarastats.netBalance >= 0 ? 'text-purple-900' : 'text-orange-900'
                    }`}>Net Balance</span>
                </div>
                <p className={`text-xs sm:text-xl font-bold break-words ${bhandarastats.netBalance >= 0 ? 'text-purple-900' : 'text-orange-900'
                  }`}>
                  {formatCurrency(bhandarastats.netBalance)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Donations & Spending Section */}
        <DonationsSpendingSection
          bhandara={{
            id: bhandara.id,
            name: bhandara.name,
            date: bhandara.date,
            isLocked: bhandara.isLocked || false
          }}
          donations={donations}
          allDonors={allDonors || []}
          donationMap={donationMap}
          bhandaraSpendings={bhandaraSpendings || []}
          allSpendingItems={allSpendingItems || []}
          uploadbuttonActive={uploadbuttonActive}
        />
      </div>
    </div >
  )
}