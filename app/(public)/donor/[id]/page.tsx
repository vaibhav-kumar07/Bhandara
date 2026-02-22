import { getDonorById } from '@/actions/Donor'
import { AlertCircle, ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

export default async function PublicDonorDetailPage({ params }: { params: { id: string } }) {
  const result = await getDonorById(params.id)
  console.log(result)
  const donor = result.donor
  const donations = result.donations || []
  const totalAmount = donations.reduce((acc: number, donation: any) => acc + donation.amount, 0)

  if (!result.success || !donor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-md shadow-sm px-3 py-2 border border-gray-200 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
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
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-3 sm:py-4">
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-4">
        {/* Header */}
        <div className="">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2 " />
            Back to Home
          </Link>
          <div className="bg-white rounded-md shadow-sm px-3 py-2 border border-gray-200 space-y-1">
            <div className="flex items-center justify-between ">
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-blue-600" />
                <h1 className="capitalize text-base sm:text-lg font-bold text-gray-900">
                  {donor.donorName}{donor.fatherName ? ` / ${donor.fatherName}` : ''}
                </h1>
              </div>
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
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <p className="text-gray-600">No donations found for this donor.</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {donations.map((donation: any) => (
                <div
                  className={`
          bg-white rounded-lg border transition-all duration-200
          hover:border-blue-300 hover:shadow-sm active:scale-[0.98] active:shadow-none cursor-pointer border-gray-200
          px-2.5 py-2 sm:px-2.5 sm:py-2.5 md:px-3 md:py-3
        `}
                >
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    {/* Left: Bhandara Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate capitalize">
                          {donation.bhandara.name}
                        </h3>
                        <span className="text-[10px] sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                          {new Date(donation.bhandara.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Right: Amount and Mode */}
                    <div className="flex items-center gap-1 sm:gap-1.5 sm:gap-2 shrink-0">
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        ₹{donation.amount.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`
                text-xs font-medium px-1.5 py-0.5 sm:px-1.5 sm:py-0.5 rounded whitespace-nowrap
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

