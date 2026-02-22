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

    // Total spendings
    const totalSpendings = await db.collection(COLLECTIONS.BHANDARA_SPENDINGS).countDocuments()

    // Total spent amount
    const totalSpentResult = await db.collection(COLLECTIONS.BHANDARA_SPENDINGS).aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]).toArray()

    const totalSpentAmount = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0
    const netBalance = totalAmount - totalSpentAmount

    // Recent donations and spendings (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentDonations = await db.collection(COLLECTIONS.DONATIONS).countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    })

    const recentSpendings = await db.collection(COLLECTIONS.BHANDARA_SPENDINGS).countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    })

    return {
      totalBhandaras,
      activeBhandaras,
      totalDonors,
      totalDonations,
      totalCollectedAmount,
      totalPendingAmount,
      totalSpentAmount,
      totalSpendings,
      netBalance,
      recentDonations,
      recentSpendings
    }
  }

  export async function getBhandaraStats(): Promise<BhandaraStats[]> {
    const db = getDatabase()

    // Get all bhandaras first
    const bhandaras = await db.collection(COLLECTIONS.BHANDARAS).find({}).toArray()
    
    const results: BhandaraStats[] = []

    for (const bhandara of bhandaras) {
      const bhandaraId = bhandara._id.toString()
      
      // Get donation stats
      const donationStats = await db.collection(COLLECTIONS.DONATIONS).aggregate([
        {
          $match: { bhandara: bhandara._id }
        },
        {
          $group: {
            _id: null,
            totalCollected: { $sum: '$amount' },
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
        }
      ]).toArray()

      // Get spending stats
      const spendingStats = await db.collection(COLLECTIONS.BHANDARA_SPENDINGS).aggregate([
        {
          $match: { bhandara: bhandara._id }
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$amount' },
            totalSpendings: { $sum: 1 },
            spendingCashAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$paymentMode', PAYMENT_MODE.CASH] },
                  '$amount',
                  0
                ]
              }
            },
            spendingUpiAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$paymentMode', PAYMENT_MODE.UPI] },
                  '$amount',
                  0
                ]
              }
            },
            spendingBankAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$paymentMode', PAYMENT_MODE.BANK] },
                  '$amount',
                  0
                ]
              }
            }
          }
        }
      ]).toArray()

      const donationData = donationStats[0] || {
        totalCollected: 0,
        totalDonations: 0,
        donorCount: [],
        cashAmount: 0,
        upiAmount: 0,
        bankAmount: 0
      }

      const spendingData = spendingStats[0] || {
        totalSpent: 0,
        totalSpendings: 0,
        spendingCashAmount: 0,
        spendingUpiAmount: 0,
        spendingBankAmount: 0
      }

      results.push({
        bhandaraId,
        bhandaraName: bhandara.name,
        totalCollected: donationData.totalCollected,
        totalPending: 0,
        totalDonations: donationData.totalDonations,
        donorCount: donationData.donorCount.length,
        totalSpent: spendingData.totalSpent,
        totalSpendings: spendingData.totalSpendings,
        netBalance: donationData.totalCollected - spendingData.totalSpent,
        paymentModeBreakdown: {
          cash: donationData.cashAmount,
          upi: donationData.upiAmount,
          bank: donationData.bankAmount
        },
        spendingModeBreakdown: {
          cash: spendingData.spendingCashAmount,
          upi: spendingData.spendingUpiAmount,
          bank: spendingData.spendingBankAmount
        }
      })
    }

    return results.sort((a, b) => b.totalCollected - a.totalCollected)
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

  // Get donation stats
  const donationStats = await db.collection(COLLECTIONS.DONATIONS).aggregate([
    {
      $match: { bhandara: bhandaraObjectId }
    },
    {
      $group: {
        _id: null,
        totalCollected: { $sum: '$amount' },
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
    }
  ]).toArray()

  // Get spending stats
  const spendingStats = await db.collection(COLLECTIONS.BHANDARA_SPENDINGS).aggregate([
    {
      $match: { bhandara: bhandaraObjectId }
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' },
        totalSpendings: { $sum: 1 },
        spendingCashAmount: {
          $sum: {
            $cond: [
              { $eq: ['$paymentMode', PAYMENT_MODE.CASH] },
              '$amount',
              0
            ]
          }
        },
        spendingUpiAmount: {
          $sum: {
            $cond: [
              { $eq: ['$paymentMode', PAYMENT_MODE.UPI] },
              '$amount',
              0
            ]
          }
        },
        spendingBankAmount: {
          $sum: {
            $cond: [
              { $eq: ['$paymentMode', PAYMENT_MODE.BANK] },
              '$amount',
              0
            ]
          }
        }
      }
    }
  ]).toArray()

  const donationData = donationStats[0] || {
    totalCollected: 0,
    totalDonations: 0,
    donorCount: [],
    cashAmount: 0,
    upiAmount: 0,
    bankAmount: 0
  }

  const spendingData = spendingStats[0] || {
    totalSpent: 0,
    totalSpendings: 0,
    spendingCashAmount: 0,
    spendingUpiAmount: 0,
    spendingBankAmount: 0
  }

  return {
    bhandaraId,
    bhandaraName: bhandara.name,
    totalCollected: donationData.totalCollected,
    totalPending: 0,
    totalDonations: donationData.totalDonations,
    donorCount: donationData.donorCount.length,
    totalSpent: spendingData.totalSpent,
    totalSpendings: spendingData.totalSpendings,
    netBalance: donationData.totalCollected - spendingData.totalSpent,
    paymentModeBreakdown: {
      cash: donationData.cashAmount,
      upi: donationData.upiAmount,
      bank: donationData.bankAmount
    },
    spendingModeBreakdown: {
      cash: spendingData.spendingCashAmount,
      upi: spendingData.spendingUpiAmount,
      bank: spendingData.spendingBankAmount
    }
  }
}
