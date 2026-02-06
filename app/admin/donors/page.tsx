import { getAllDonorsWithDonations } from '@/actions/Donor'
import DonorListCard from '@/app/components/donors/DonorListCard'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

export default async function DonorsPage() {
  const result = await getAllDonorsWithDonations()

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
              <p className="text-gray-600">No donors available. Add donors from the dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {result.donors.map((donor) => (
                <DonorListCard
                  key={donor.id}
                  donor={donor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

