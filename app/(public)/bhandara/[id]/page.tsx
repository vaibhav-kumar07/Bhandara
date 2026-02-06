import { getBhandaraDetails } from '@/actions/BhandaraDetail'
import PublicDonorCard from '@/app/components/bhandara/PublicDonorCard'
import { Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function PublicBhandaraDetailPage({ params }: { params: { id: string } }) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:py-8">
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
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {bhandara.name}
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              Date: {new Date(bhandara.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Donors Grid */}
        <div>
          <div className="w-full mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              All Donors ({allDonors?.length || 0}) - Donations ({donations.length})
            </h2>
          </div>
          {!allDonors || allDonors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <p className="text-gray-600">No donors available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {allDonors.map((donor) => {
                const donation = donationMap.get(donor.id)
                return (
                  <PublicDonorCard
                    key={donor.id}
                    donor={donor}
                    donation={donation}
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

