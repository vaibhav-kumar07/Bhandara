import { getAllDonorsWithDonations } from '@/actions/Donor'
import DonorDonationsModal from '@/app/components/donors/DonorDonationsModal'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

export default async function PublicDonorDetailPage({ params }: { params: { id: string } }) {
  const result = await getAllDonorsWithDonations()
  
  const donor = result.donors?.find((d: any) => d.id === params.id)

  if (!donor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-red-600">Donor not found</p>
            <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
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
              <Users className="w-5 h-5 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {donor.donorName} / {donor.wifeName}
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              {donor.donations?.length || 0} {donor.donations?.length === 1 ? 'donation' : 'donations'} total
            </p>
          </div>
        </div>

        {/* Donations List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            All Donations
          </h2>
          
          {!donor.donations || donor.donations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <p className="text-gray-600">No donations found for this donor.</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {donor.donations.map((donation: any) => (
                <div
                  key={donation.id}
                  className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-blue-300 hover:shadow-sm transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    {/* Bhandara Name */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                        {donation.bhandara.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                        {new Date(donation.bhandara.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    {/* Amount and Mode */}
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <span className="font-bold text-gray-900 whitespace-nowrap">
                        ₹{donation.amount.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`
                          text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded whitespace-nowrap
                          ${donation.paymentMode === 'cash'
                            ? 'bg-yellow-100 text-yellow-800'
                            : donation.paymentMode === 'upi'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'}
                        `}
                      >
                        {donation.paymentMode === 'cash' ? 'Cash' : donation.paymentMode === 'upi' ? 'Online' : 'Bank'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

