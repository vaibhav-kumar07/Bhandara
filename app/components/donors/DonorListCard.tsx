import Link from 'next/link'
import { DonorResponse } from '@/lib/donor/donor.types'
import { DonationResponse } from '@/lib/donation/donation.types'

interface DonorWithDonations extends DonorResponse {
  donations: DonationResponse[]
}

export default function DonorListCard({ donor }: { donor: DonorWithDonations }) {
  return (
    <Link
      href={`/admin/donor/${donor.id}`}
      className="
        rounded-lg border bg-white
        px-3 py-2
        active:scale-[0.98]
        transition
        cursor-pointer
        hover:border-blue-300
        hover:shadow-sm
        block
      "
    >
      <div className="flex items-center justify-between gap-3">
        {/* Names */}
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-gray-900 truncate">
            {donor.donorName}
            <span className="text-gray-600 font-medium">
              {' / '}{donor.wifeName}
            </span>
          </p>
        </div>

        {/* Donation Count */}
        <div className="flex flex-col items-end shrink-0">
          <p className="text-sm font-medium text-gray-600">
            {donor.donations.length} {donor.donations.length === 1 ? 'donation' : 'donations'}
          </p>
        </div>
      </div>
    </Link>
  )
}

