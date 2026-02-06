import { getDatabase } from '@/lib/shared/db'
import { COLLECTIONS, PAYMENT_MODE, BHANDARA_STATUS } from '@/lib/shared/constants'
import { BhandaraStats, OverallStats, StatsResponse } from './stats.types'

export class StatsService {
  static async  getStats(): Promise<StatsResponse> {
    const db = getDatabase()

    // Get overall stats
    const overall = await this.getOverallStats()
    
    // Get bhandara-wise stats
    const bhandaras = await this.getBhandaraStats()

    return {
      overall,
      bhandaras
    }
  }

  static async getOverallStats(): Promise<OverallStats> {
    const db = getDatabase()

    // Total bhandaras
    const totalBhandaras = await db.collection(COLLECTIONS.BHANDARAS).countDocuments()
    
    // Active bhandaras
    const activeBhandaras = await db.collection(COLLECTIONS.BHANDARAS).countDocuments({
      status: BHANDARA_STATUS.ACTIVE
    })

    // Total donors
    const totalDonors = await db.collection(COLLECTIONS.DONORS).countDocuments()

    // Total donations
    const totalDonations = await db.collection(COLLECTIONS.DONATIONS).countDocuments()

    // Total amount (all donations regardless of status)
    const totalAmountResult = await db.collection(COLLECTIONS.DONATIONS).aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]).toArray()

    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0
    const totalCollectedAmount = totalAmount
    const totalPendingAmount = 0

    // Recent donations (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentDonations = await db.collection(COLLECTIONS.DONATIONS).countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    })

    return {
      totalBhandaras,
      activeBhandaras,
      totalDonors,
      totalDonations,
      totalCollectedAmount,
      totalPendingAmount,
      recentDonations
    }
  }

  private static async getBhandaraStats(): Promise<BhandaraStats[]> {
    const db = getDatabase()

    const stats = await db.collection(COLLECTIONS.DONATIONS).aggregate([
      {
        $lookup: {
          from: COLLECTIONS.BHANDARAS,
          localField: 'bhandara',
          foreignField: '_id',
          as: 'bhandaraData'
        }
      },
      {
        $unwind: '$bhandaraData'
      },
      {
        $group: {
          _id: '$bhandara',
          bhandaraName: { $first: '$bhandaraData.name' },
          totalCollected: {
            $sum: '$amount'
          },
          totalDonations: { $sum: 1 },
          donorCount: { $addToSet: '$donor' },
          cashAmount: {
            $sum: {
              $cond: [
                { $eq: ['$paymentMode', PAYMENT_MODE.CASH] },
                '$amount',
                0
              ]
            }
          },
          upiAmount: {
            $sum: {
              $cond: [
                { $eq: ['$paymentMode', PAYMENT_MODE.UPI] },
                '$amount',
                0
              ]
            }
          },
          bankAmount: {
            $sum: {
              $cond: [
                { $eq: ['$paymentMode', PAYMENT_MODE.BANK] },
                '$amount',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          bhandaraId: { $toString: '$_id' },
          bhandaraName: 1,
          totalCollected: 1,
          totalPending: { $literal: 0 },
          totalDonations: 1,
          donorCount: { $size: '$donorCount' },
          paymentModeBreakdown: {
            cash: '$cashAmount',
            upi: '$upiAmount',
            bank: '$bankAmount'
          }
        }
      },
      {
        $sort: { totalCollected: -1 }
      }
    ]).toArray()

    return stats.map(stat => ({
      bhandaraId: stat.bhandaraId,
      bhandaraName: stat.bhandaraName,
      totalCollected: stat.totalCollected,
      totalPending: stat.totalPending,
      totalDonations: stat.totalDonations,
      donorCount: stat.donorCount,
      paymentModeBreakdown: stat.paymentModeBreakdown
    }))
  }

  static async getBhandaraStatsById(bhandaraId: string): Promise<BhandaraStats | null> {
    const db = getDatabase()

    const stats = await db.collection(COLLECTIONS.DONATIONS).aggregate([
      {
        $match: { bhandara: { $eq: { $toObjectId: bhandaraId } } }
      },
      {
        $lookup: {
          from: COLLECTIONS.BHANDARAS,
          localField: 'bhandara',
          foreignField: '_id',
          as: 'bhandaraData'
        }
      },
      {
        $unwind: '$bhandaraData'
      },
      {
        $group: {
          _id: '$bhandara',
          bhandaraName: { $first: '$bhandaraData.name' },
          totalCollected: {
            $sum: '$amount'
          },
          totalDonations: { $sum: 1 },
          donorCount: { $addToSet: '$donor' },
          cashAmount: {
            $sum: {
              $cond: [
                { $eq: ['$paymentMode', PAYMENT_MODE.CASH] },
                '$amount',
                0
              ]
            }
          },
          upiAmount: {
            $sum: {
              $cond: [
                { $eq: ['$paymentMode', PAYMENT_MODE.UPI] },
                '$amount',
                0
              ]
            }
          },
          bankAmount: {
            $sum: {
              $cond: [
                { $eq: ['$paymentMode', PAYMENT_MODE.BANK] },
                '$amount',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          bhandaraId: { $toString: '$_id' },
          bhandaraName: 1,
          totalCollected: 1,
          totalPending: { $literal: 0 },
          totalDonations: 1,
          donorCount: { $size: '$donorCount' },
          cashAmount: 1,
          upiAmount: 1,
          bankAmount: 1
        }
      }
    ]).toArray()

    if (stats.length === 0) return null

    const stat = stats[0]
    return {
      bhandaraId,
      bhandaraName: stat.bhandaraName,
      totalCollected: stat.totalCollected,
      totalPending: stat.totalPending || 0,
      totalDonations: stat.totalDonations,
      donorCount: stat.donorCount,
      paymentModeBreakdown: {
        cash: stat.cashAmount || 0,
        upi: stat.upiAmount || 0,
        bank: stat.bankAmount || 0
      }
    }
  }
}
