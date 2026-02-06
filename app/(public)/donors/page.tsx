import { getAllDonorsWithDonations } from '@/actions/Donor'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

export default async function PublicDonorsPage() {
  const result = await getAllDonorsWithDonations()

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
              <Users className="w-5 h-5 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                All Donors
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              Total Donors: {result.donors?.length || 0}
            </p>
          </div>
        </div>

        {/* Donors Grid */}
        <div>
          {!result.success || !result.donors || result.donors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <p className="text-gray-600">No donors available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {result.donors.map((donor: any) => (
                <Link
                  key={donor.id}
                  href={`/donor/${donor.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md hover:border-blue-300 transition cursor-pointer block"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {donor.donorName}
                        <span className="text-gray-600 font-medium">
                          {' / '}{donor.wifeName}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <p className="text-sm font-medium text-gray-600">
                        {donor.donations?.length || 0} {donor.donations?.length === 1 ? 'donation' : 'donations'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

