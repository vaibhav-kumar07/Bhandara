import { getAllDonorsWithDonations } from '@/actions/Donor'
import DonorListCard from '@/app/components/donors/DonorListCard'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'
import { getCurrentAdmin } from '@/lib/auth/jwt'

export default async function DonorsPage() {
  const result = await getAllDonorsWithDonations()
  const admin = await getCurrentAdmin()
  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
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
          {!result.success || !result.donors || result.donors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <p className="text-gray-600">No donors available. Add donors from the dashboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 pb-4">
              {result.donors.map((donor, index) => (
                <DonorListCard
                  key={donor.id}
                  donor={donor}
                  admin={admin ? true : false}
                  index={index + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

