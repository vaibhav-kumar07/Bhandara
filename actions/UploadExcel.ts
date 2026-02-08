'use server'
import { connectToDatabase, getDatabase } from '@/lib/shared/db'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import { COLLECTIONS, PAYMENT_MODE, PAYMENT_STATUS } from '@/lib/shared/constants'
import { ObjectId } from 'mongodb'
import { BhandaraModel } from '@/lib/bhandara/bhandara.model'
import { isBhandaraLocked } from '@/lib/shared/utils'

export interface ProcessedDonorData {
  firstName: string
  lastName: string
  amount: number
  rowNumber: number
}

export async function bulkUploadDonations(
  donorData: ProcessedDonorData[],
  bhandaraId: string
): Promise<{
  success: boolean
  message: string
  results: {
    success: number
    failed: number
    errors: string[]
  }
}> {
  try {
    await connectToDatabase()
    
    const admin = await getCurrentAdmin()
    if (!admin) {
      return {
        success: false,
        message: 'Unauthorized',
        results: { success: 0, failed: 0, errors: ['Unauthorized access'] }
      }
    }

    // Validate bhandara
    const bhandara = await BhandaraModel.findById(bhandaraId)
    if (!bhandara) {
      return {
        success: false,
        message: 'Bhandara not found',
        results: { success: 0, failed: 0, errors: ['Bhandara not found'] }
      }
    }

    if (isBhandaraLocked(bhandara.date)) {
      return {
        success: false,
        message: 'Bhandara is locked',
        results: { success: 0, failed: 0, errors: ['Bhandara is locked. Cannot add donations after the event date.'] }
      }
    }

    if (!donorData || donorData.length === 0) {
      return {
        success: false,
        message: 'No data provided',
        results: { success: 0, failed: 0, errors: ['No valid data to upload'] }
      }
    }

    const db = getDatabase()
    const donorsCollection = db.collection(COLLECTIONS.DONORS)
    const donationsCollection = db.collection(COLLECTIONS.DONATIONS)

    const errors: string[] = []

    // Prepare donor map and bulk operations
    const donorMap = new Map<string, ObjectId>()
    const donorBulkOps: any[] = []
    const uniqueDonors = new Map<string, { firstName: string; lastName: string }>()

    // Collect unique donors (handle empty lastName as optional)
    // Use lowercase for case-insensitive matching
    for (const row of donorData) {
      const key = `${row.firstName.toLowerCase()}_${(row.lastName || '').toLowerCase()}`
      if (!uniqueDonors.has(key)) {
        uniqueDonors.set(key, { firstName: row.firstName, lastName: row.lastName || '' })
      }
    }

    // Find existing donors in bulk
    if (uniqueDonors.size > 0) {
      try {
        const donorQueries = Array.from(uniqueDonors.values()).map(donor => {
          if (donor.lastName) {
            return {
              donorName: donor.firstName,
              fatherName: donor.lastName
            }
          } else {
            return {
              donorName: donor.firstName,
              $or: [
                { fatherName: { $exists: false } },
                { fatherName: '' },
                { fatherName: null }
              ]
            }
          }
        })
        
        const existingDonors = await donorsCollection.find({
          $or: donorQueries
        }).toArray()

        // Map existing donors (use lowercase for case-insensitive matching)
        existingDonors.forEach(donor => {
          const key = `${(donor.donorName || '').toLowerCase()}_${(donor.fatherName || '').toLowerCase()}`
          donorMap.set(key, donor._id)
        })
      } catch (findError: any) {
        console.error('Error finding existing donors:', findError)
        throw new Error(`Failed to find existing donors: ${findError.message}`)
      }
    }

    // Prepare upsert operations for new donors
    for (const [key, donor] of uniqueDonors.entries()) {
      if (!donorMap.has(key)) {
        const filter: any = { donorName: donor.firstName }
        const setOnInsert: any = {
          donorName: donor.firstName,
          createdAt: new Date()
        }
        
        if (donor.lastName) {
          filter.fatherName = donor.lastName
          setOnInsert.fatherName = donor.lastName
        } else {
          filter.$or = [
            { fatherName: { $exists: false } },
            { fatherName: '' },
            { fatherName: null }
          ]
        }
        
        donorBulkOps.push({
          updateOne: {
            filter,
            update: {
              $setOnInsert: setOnInsert
            },
            upsert: true
          }
        })
      }
    }

    // Execute bulk write for donors
    if (donorBulkOps.length > 0) {
      try {
        const donorResult = await donorsCollection.bulkWrite(donorBulkOps, { ordered: false })
        
        // Fetch newly created donors from upsertedIds
        if (donorResult.upsertedCount > 0 && donorResult.upsertedIds) {
          const upsertedIds = Object.values(donorResult.upsertedIds).filter(id => id) as ObjectId[]
          if (upsertedIds.length > 0) {
            const newDonors = await donorsCollection.find({
              _id: { $in: upsertedIds }
            }).toArray()
            
            newDonors.forEach(donor => {
              const key = `${(donor.donorName || '').toLowerCase()}_${(donor.fatherName || '').toLowerCase()}`
              donorMap.set(key, donor._id)
            })
          }
        }
      } catch (bulkError: any) {
        console.error('Error in bulk write for donors:', bulkError)
        throw new Error(`Failed to create donors: ${bulkError.message}`)
      }
    }

    // Final fetch to ensure all donors are in the map
    if (uniqueDonors.size > 0) {
      try {
        const donorQueries = Array.from(uniqueDonors.values()).map(donor => {
          if (donor.lastName) {
            return {
              donorName: donor.firstName,
              fatherName: donor.lastName
            }
          } else {
            return {
              donorName: donor.firstName,
              $or: [
                { fatherName: { $exists: false } },
                { fatherName: '' },
                { fatherName: null }
              ]
            }
          }
        })
        
        const allDonors = await donorsCollection.find({
          $or: donorQueries
        }).toArray()

        allDonors.forEach(donor => {
          const key = `${(donor.donorName || '').toLowerCase()}_${(donor.fatherName || '').toLowerCase()}`
          donorMap.set(key, donor._id)
        })
      } catch (findError: any) {
        console.error('Error in final donor fetch:', findError)
      }
    }

    // Prepare bulk insert for donations (skip if amount is 0)
    const donationDocs: any[] = []
    const adminId = new ObjectId(admin.adminId)
    const bhandaraObjectId = new ObjectId(bhandaraId)
    const now = new Date()
    
    let donorSuccessCount = 0
    let donationSuccessCount = 0

    for (const row of donorData) {
      // Use lowercase key for case-insensitive matching
      const key = `${row.firstName.toLowerCase()}_${(row.lastName || '').toLowerCase()}`
      const donorId = donorMap.get(key)
      
      if (!donorId) {
        errors.push(`Row ${row.rowNumber}: Failed to find or create donor`)
        continue
      }

      // Count donor creation as success
      donorSuccessCount++

      // Skip donation creation if amount is 0 (donor is still created)
      if (row.amount === 0) {
        continue
      }

      donationDocs.push({
        donor: donorId,
        bhandara: bhandaraObjectId,
        amount: row.amount,
        paymentStatus: PAYMENT_STATUS.DONE,
        paymentMode: PAYMENT_MODE.CASH,
        date: now,
        admin: adminId,
        isLocked: false,
        createdAt: now,
        updatedAt: now
      })
    }

    // Execute bulk insert for donations
    if (donationDocs.length > 0) {
      try {
        const donationResult = await donationsCollection.insertMany(donationDocs, { ordered: false })
        donationSuccessCount = donationResult.insertedCount
      } catch (error: any) {
        // Some donations might have failed (e.g., duplicate key)
        if (error.writeErrors) {
          donationSuccessCount = donationDocs.length - error.writeErrors.length
          error.writeErrors.forEach((writeError: any) => {
            const originalRow = donorData[writeError.index]
            errors.push(`Row ${originalRow?.rowNumber || writeError.index + 1}: ${writeError.errmsg || 'Failed to create donation'}`)
          })
        } else {
          throw error
        }
      }
    }

    const totalSuccess = donorSuccessCount
    const totalDonations = donationSuccessCount
    const donorsWithoutDonations = donorSuccessCount - donationSuccessCount

    let message = `Processed ${totalSuccess} donor${totalSuccess !== 1 ? 's' : ''} successfully`
    if (totalDonations > 0) {
      message += `, ${totalDonations} with donation${totalDonations !== 1 ? 's' : ''}`
    }
    if (donorsWithoutDonations > 0) {
      message += `, ${donorsWithoutDonations} without donation${donorsWithoutDonations !== 1 ? 's' : ''} (amount 0)`
    }
    if (errors.length > 0) {
      message += `, ${errors.length} failed`
    }

    return {
      success: true,
      message,
      results: {
        success: totalSuccess,
        failed: errors.length,
        errors
      }
    }
  } catch (error: any) {
    console.error('Error processing bulk upload:', error)
    const errorMessage = error?.message || error?.toString() || 'Failed to process bulk upload'
    return {
      success: false,
      message: errorMessage,
      results: {
        success: 0,
        failed: 0,
        errors: [errorMessage]
      }
    }
  }
}
