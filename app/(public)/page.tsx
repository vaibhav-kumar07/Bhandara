import { Metadata } from 'next'
import Link from 'next/link'
import { getOverallStats } from '../../actions/Stats'
import { getAllBhandarasWithStats } from '../../actions/Bhandara'
import { getAllDonorsWithDonations } from '../../actions/Donor'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import StatsCard from '../components/StatsCard'
import AdminQuickActions from '../components/shared/AdminQuickActions'
import { DollarSign, Users, BarChart3, Calendar, ArrowRight } from 'lucide-react'
import BhandaraCard from '../components/bhandara/BhandaraCard'

export const metadata: Metadata = {
  title: 'Bhandara Donation System',
  description: 'Transparent donation tracking for Bhandara events',
  viewport: 'width=device-width, initial-scale=1',
}

export default async function PublicPage() {
  const stats: any = await getOverallStats()
  const bhandarasResult = await getAllBhandarasWithStats()
  const bhandaras = (bhandarasResult?.success && bhandarasResult?.bhandaras) ? bhandarasResult.bhandaras : []
  const donorsResult = await getAllDonorsWithDonations()
  const donors = (donorsResult?.success && donorsResult?.donors) ? donorsResult.donors : []
  const admin = await getCurrentAdmin()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 hide-scrollbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Bhandara Donation Transparency
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            View all donations and track transparency in our Bhandara events
          </p>
        </div>

        {/* Admin Quick Actions */}
      

        {/* Overall Stats */}
        {stats && stats.overall && (
          <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${admin ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            <StatsCard
              title="Total Donations"
              value={(stats.overall.totalCollectedAmount || 0) + (stats.overall.totalPendingAmount || 0)}
              color="green"
              icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />}
            />
            <StatsCard
              title="Total Donors"
              value={stats.overall.totalDonors || 0}
              color="blue"
              icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
            />
            <StatsCard
              title="Total Count"
              value={stats.overall.totalDonations || 0}
              color="gray"
              icon={<BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />}
            />
            {admin && <AdminQuickActions admin={admin} />}
          </div>
        )}

        {/* Bhandaras List */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            All Bhandaras
          </h2>
          
          {!bhandaras || bhandaras.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No bhandaras available.</p>
              {bhandarasResult && !bhandarasResult.success && (
                <p className="text-red-500 text-sm mt-2">
                  {bhandarasResult.message || 'Error loading bhandaras'}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 hide-scrollbar">
              {bhandaras.map((bhandara: any) => (
                <BhandaraCard
                  key={bhandara.id}
                  bhandara={bhandara}
                  isAdmin={!!admin}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Donors Section */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6 hide-scrollbar">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              All Donors
            </h2>
            <Link
              href="/donors"
              className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {donors.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No donors available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 hide-scrollbar">
              {donors.slice(0, 6).map((donor: any) => (
                <Link
                  key={donor.id}
                  href={admin ? `/admin/donor/${donor.id}` : `/donor/${donor.id}`}
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