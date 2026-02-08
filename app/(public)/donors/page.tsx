import { getAllDonorsWithDonations } from '@/actions/Donor'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

export default async function PublicDonorsPage() {
  const result = await getAllDonorsWithDonations()
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-3 sm:py-4">
      <div className="max-w-6xl mx-auto space-y-2 sm:space-y-4">
        <div className="">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2 "
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Home
          </Link>
          <div className="bg-white rounded-md shadow-sm px-3 py-2 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3 ">
              <Users className="w-4 h-4 text-blue-600" />
              <h1 className="text-base sm:text-lg font-bold text-gray-900">
                All Donors ({result.donors?.length || 0})
              </h1>
            </div>
          </div>
        </div>

        {/* Donors Grid */}
        <div>
          {!result.success || !result.donors || result.success && result.donors.length === 0 ? (
            <div className="bg-white rounded-md shadow-sm p-4 sm:p-8 text-center border border-gray-100">
              <p className="text-gray-600">No donors available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {result.success && result.donors.map((donor: any, index: number) => (
                <Link
                  key={donor.id}
                  href={`/donor/${donor.id}`}
                  className="bg-white rounded-md shadow-sm border border-gray-200 p-2 sm:p-3 hover:shadow-md hover:border-blue-300 transition cursor-pointer block"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-semibold text-gray-900 truncate capitalize">
                        {index + 1}.  {donor.donorName}
                        {donor.fatherName && (
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">
                            {' / '}{donor.fatherName}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
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

