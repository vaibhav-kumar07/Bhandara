import { DonationResponse } from '@/types'

interface DonationCardProps {
  donation: DonationResponse
  showBhandara?: boolean
  onEdit?: (donation: DonationResponse) => void
}

export default function DonationCard({ donation, showBhandara = true, onEdit }: DonationCardProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {donation.donor.donorName} & {donation.donor.wifeName}
          </h3>
          {showBhandara && (
            <p className="text-sm text-gray-600 mt-1">
              {donation.bhandara.name} • {formatDate(donation.bhandara.date)}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-green-600">
            {formatAmount(donation.amount)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="status-badge bg-blue-100 text-blue-800">
          {donation.paymentMode.toUpperCase()}
        </span>
        {donation.isLocked && (
          <span className="status-badge bg-red-100 text-red-800">
            🔒 Locked
          </span>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>Added by: {donation.admin}</p>
        <p>Date: {formatDate(donation.date)}</p>
        {donation.note && (
          <p className="text-gray-700 bg-gray-100 p-2 rounded text-sm mt-2">
            <strong>Note:</strong> {donation.note}
          </p>
        )}
      </div>

      {onEdit && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => onEdit(donation)}
            className="btn btn-secondary text-sm w-full"
            disabled={donation.isLocked}
          >
            {donation.isLocked ? 'Locked' : 'Edit'}
          </button>
        </div>
      )}
    </div>
  )
}
