import { getAllDonorsWithDonations } from '@/actions/Donor'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import EditDonorButton from '@/app/components/donors/EditDonorButton'
import DonationCard from '@/app/components/donors/DonationCard'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AdminDonorDetailPage({ params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  
  // Redirect if not admin
  if (!admin) {
    redirect('/')
  }

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
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:py-8">
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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {donor.donorName} / {donor.wifeName}
                </h1>
              </div>
              <EditDonorButton donor={donor} />
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
            <div className="space-y-1.5 sm:space-y-2">
              {donor.donations.map((donation: any) => (
                <DonationCard
                  key={donation.id}
                  donation={donation}
                  bhandaraId={donation.bhandara.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

