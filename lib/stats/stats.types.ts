export interface BhandaraStats {
  bhandaraId: string
  bhandaraName: string
  totalCollected: number
  totalPending: number
  totalDonations: number
  donorCount: number
  paymentModeBreakdown: {
    cash: number
    upi: number
    bank: number
  }
}

export interface OverallStats {
  totalBhandaras: number
  activeBhandaras: number
  totalDonors: number
  totalDonations: number
  totalCollectedAmount: number
  totalPendingAmount: number
  recentDonations: number // Last 7 days
}

export interface StatsResponse {
  overall: OverallStats
  bhandaras: BhandaraStats[]
}
