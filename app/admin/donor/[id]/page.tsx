import dynamic from 'next/dynamic'
import { getDonorById } from '@/actions/Donor'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import EditDonorButton from '@/app/components/donors/EditDonorButton'
import DonationCard from '@/app/components/donors/DonationCard'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'
import { DonorResponse } from '@/lib/donor/donor.types'
import { redirect } from 'next/navigation'


export default async function AdminDonorDetailPage({ params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()

  // Redirect if not admin
  if (!admin) {
    redirect('/admin/login')
  }

  const result = await getDonorById(params.id)
  const donor = result.donor
  const donations = result.donations || []
  const totalAmount = donations.reduce((acc: number, donation: any) => acc + donation.amount, 0)


  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-3 sm:py-4">
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4">
        <div className="">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2 " />
            Back to Home
          </Link>
          <div className="bg-white rounded-md shadow-sm px-3 py-2 border border-gray-200 w-full flex flex-col gap-1 min-w-0">
            <div className="flex items-center justify-between ">
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-blue-600" />
                <p className="text-sm sm:text-base font-semibold text-gray-900 truncate capitalize">
                  {donor?.donorName}
                  {donor?.fatherName && (
                    <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                      {' / '}{donor?.fatherName}
                    </span>
                  )}
                </p>
              </div>
              <EditDonorButton donor={donor as DonorResponse} />
            </div>
            {donations.length > 0 && <p className="text-xs sm:text-sm text-gray-600 ">
              Total Donation Amount: ₹{totalAmount.toLocaleString('en-IN')}
            </p>}
          </div>
        </div>

        {/* Donations List */}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
            All Donations
          </h2>

          {!donations || donations.length === 0 ? (
            <div className="bg-white rounded-md shadow-sm px-3 py-2 border border-gray-200 text-center">
              <p className="text-gray-600">No donations found for this donor.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {donations.map((donation: any, index: number) => (
                <DonationCard
                  key={donation.id}
                  donation={donation}
                  bhandaraId={donation.bhandara.id}
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

