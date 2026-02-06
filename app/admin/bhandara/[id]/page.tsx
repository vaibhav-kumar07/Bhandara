import { getBhandaraDetails } from '@/actions/BhandaraDetail'
import DonorCard from '@/app/components/bhandara/DonorCard'
import AddDonorDonation from '@/app/components/bhandara/AddDonorDonation'
import EditBhandaraButton from '@/app/components/bhandara/EditBhandaraButton'
import DeleteBhandaraButton from '@/app/components/bhandara/DeleteBhandaraButton'
import { Calendar, ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'

export default async function BhandaraDetailPage({ params }: { params: { id: string } }) {
  const result = await getBhandaraDetails(params.id)

  if (!result.success || !result.bhandara) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:py-8">
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

  const { bhandara, donations, allDonors } = result
  
  // Create a map of donations by donor ID for quick lookup
  const donationMap = new Map()
  donations.forEach((donation) => {
    donationMap.set(donation.donor.id, donation)
  })

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Calendar className="w-5 h-5 text-green-600 shrink-0" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
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
                      date: bhandara.date
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
            <p className="text-sm text-gray-600">
              Date: {new Date(bhandara.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            {bhandara.isLocked && (
              <p className="text-sm text-red-600 mt-2 font-medium">
                This bhandara is locked. Information cannot be changed after the event date.
              </p>
            )}
          </div>
        </div>

        {/* Donors Grid */}
        <div>
         <div className="w-full flex items-center justify-between mb-4">
          <h2 className="sm:w-[80%] w-[50%] text-xl font-bold text-gray-900 flex-1">
            All Donors ({allDonors?.length || 0}) - Donations ({donations.length})
          </h2>
          {!bhandara.isLocked && (
            <div className="sm:w-[20%] w-[50%]">
              <AddDonorDonation bhandaraId={bhandara.id} />
            </div>
          )}
         </div>
          {!allDonors || allDonors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <p className="text-gray-600">No donors available. Add donors from the dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {allDonors.map((donor) => {
                const donation = donationMap.get(donor.id)
                return (
                  <DonorCard
                    key={donor.id}
                    donor={donor}
                    donation={donation}
                    bhandaraId={bhandara.id}
                    isLocked={bhandara.isLocked || false}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

