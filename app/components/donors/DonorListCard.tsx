import Link from 'next/link'
import { DonorResponse } from '@/lib/donor/donor.types'
import { DonationResponse } from '@/lib/donation/donation.types'

interface DonorWithDonations extends DonorResponse {
  donations: DonationResponse[]
}

export default function DonorListCard({ donor, admin = false, index }: { donor: DonorWithDonations, admin?: boolean, index: number }) {
  return (
    <Link
      key={index}
      href={admin ? `/admin/donor/${donor.id}` : `/donor/${donor.id}`}
      className="capitalize bg-white  px-2 py-1.5 rounded-md shadow hover:shadow-md border border-gray-200 hover:border-blue-300 transition cursor-pointer block"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
            {index}. {donor.donorName}
            {donor.fatherName && (
              <span className="text-gray-600 font-medium">
                {' / '}{donor.fatherName}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <p className="text-sm font-medium text-gray-600">
            {donor.donations?.length || 0} {donor.donations?.length === 1 ? 'donation' : 'donations'}
          </p>
        </div>
      </div>
    </Link>
  )
}

