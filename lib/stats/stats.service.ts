import { getDatabase } from '@/lib/shared/db'
import { COLLECTIONS, PAYMENT_MODE, BHANDARA_STATUS } from '@/lib/shared/constants'
import { BhandaraStats, OverallStats, StatsResponse } from './stats.types'
import { ObjectId } from 'mongodb'


   export async function getStats(): Promise<StatsResponse> {
    const db = getDatabase()

    // Get overall stats
    const overall = await getOverallStats()
    
    // Get bhandara-wise stats
    const bhandaras = await getBhandaraStats()

    return {
      overall,
      bhandaras
    }
  }

  export async function getOverallStats(): Promise<OverallStats> {
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

  export async function getBhandaraStats(): Promise<BhandaraStats[]> {
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

 
export async function getBhandaraStatsById(bhandaraId: string): Promise<BhandaraStats | null> {
  const db = getDatabase()

 
  if (!/^[0-9a-fA-F]{24}$/.test(bhandaraId)) {
    return null
  }

  const bhandaraObjectId = new ObjectId(bhandaraId)

  // First, check if bhandara exists
  const bhandara = await db.collection(COLLECTIONS.BHANDARAS).findOne({ _id: bhandaraObjectId })
  if (!bhandara) {
    return null
  }

  const stats = await db.collection(COLLECTIONS.DONATIONS).aggregate([
    {
      $match: { bhandara: bhandaraObjectId }
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
      $unwind: {
        path: '$bhandaraData',
        preserveNullAndEmptyArrays: false
      }
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

  // If no donations found, return stats with zeros
  if (stats.length === 0) {
    return {
      bhandaraId,
      bhandaraName: bhandara.name,
      totalCollected: 0,
      totalPending: 0,
      totalDonations: 0,
      donorCount: 0,
      paymentModeBreakdown: {
        cash: 0,
        upi: 0,
        bank: 0
      }
    }
  }

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
