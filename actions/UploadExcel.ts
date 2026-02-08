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
    const uniqueDonors = new Map<string, { firstName: string; lastName: string; rowNumbers: number[] }>()

    // Collect unique donors (handle empty lastName as optional)
    // Use a special separator to avoid conflicts with underscores in names
    // Using ||| as separator since it's unlikely to appear in names
    for (const row of donorData) {
      // Normalize both firstName and lastName for consistent key generation
      const normalizedFirstName = (row.firstName || '').trim()
      const normalizedLastName = (row.lastName || '').trim()
      const key = `${normalizedFirstName.toLowerCase()}|||${normalizedLastName.toLowerCase()}`
      
      if (!uniqueDonors.has(key)) {
        uniqueDonors.set(key, { 
          firstName: normalizedFirstName, // Store normalized
          lastName: normalizedLastName, // Store normalized (empty string if not provided)
          rowNumbers: [row.rowNumber] 
        })
      } else {
        // Track all row numbers for this donor
        uniqueDonors.get(key)!.rowNumbers.push(row.rowNumber)
      }
    }

    // Find existing donors in bulk
    if (uniqueDonors.size > 0) {
      try {
        const donorQueries = Array.from(uniqueDonors.values()).map(donor => {
          // Check if lastName is provided and not empty (after trimming)
          if (donor.lastName && donor.lastName.trim().length > 0) {
            return {
              donorName: donor.firstName,
              fatherName: donor.lastName
            }
          } else {
            // Match donors without father name (empty, null, or missing)
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
        // Use ||| as separator to match the key format
        // Normalize fatherName consistently (handle null, undefined, empty string)
        existingDonors.forEach(donor => {
          const normalizedFatherName = (donor.fatherName || '').trim().toLowerCase()
          const key = `${(donor.donorName || '').toLowerCase()}|||${normalizedFatherName}`
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
        
        // Only set fatherName if lastName is provided and not empty
        if (donor.lastName && donor.lastName.trim().length > 0) {
          filter.fatherName = donor.lastName
          setOnInsert.fatherName = donor.lastName
        } else {
          // Match donors without father name (empty, null, or missing)
          filter.$or = [
            { fatherName: { $exists: false } },
            { fatherName: '' },
            { fatherName: null }
          ]
          // Don't set fatherName in setOnInsert - it will be undefined/missing (correct)
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
              const normalizedFatherName = (donor.fatherName || '').trim().toLowerCase()
              const key = `${(donor.donorName || '').toLowerCase()}|||${normalizedFatherName}`
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
    // This is critical - it catches donors that were matched by bulkWrite but not in initial query
    // and also ensures we have all unique donors mapped before processing donations
    if (uniqueDonors.size > 0) {
      try {
        // Get all unique donors that aren't in donorMap yet
        const missingDonors = Array.from(uniqueDonors.entries())
          .filter(([key]) => !donorMap.has(key))
          .map(([, donor]) => donor)
        
        if (missingDonors.length > 0) {
          const donorQueries = missingDonors.map(donor => {
            // Check if lastName is provided and not empty (after trimming)
            if (donor.lastName && donor.lastName.trim().length > 0) {
              return {
                donorName: donor.firstName,
                fatherName: donor.lastName
              }
            } else {
              // Match donors without father name (empty, null, or missing)
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
          
          if (donorQueries.length > 0) {
            const allDonors = await donorsCollection.find({
              $or: donorQueries
            }).toArray()

            allDonors.forEach(donor => {
              // Normalize fatherName for key matching (handle null, undefined, empty string)
              const normalizedFatherName = (donor.fatherName || '').trim().toLowerCase()
              const key = `${(donor.donorName || '').toLowerCase()}|||${normalizedFatherName}`
              if (!donorMap.has(key)) {
                donorMap.set(key, donor._id)
              }
            })
          }
        }
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
      // Normalize the same way we did when creating uniqueDonors
      const normalizedFirstName = (row.firstName || '').trim().toLowerCase()
      const normalizedLastName = (row.lastName || '').trim().toLowerCase()
      const key = `${normalizedFirstName}|||${normalizedLastName}`
      const donorId = donorMap.get(key)
      
      if (!donorId) {
        // This should not happen if all donors were properly created and mapped
        // Log detailed error for debugging
        const originalKey = `${row.firstName}|||${row.lastName || ''}`
        errors.push(`Row ${row.rowNumber}: Failed to find or create donor "${row.firstName} ${row.lastName || '(no last name)'}" (normalized key: ${key}, original: ${originalKey})`)
        console.error(`Donor lookup failed for row ${row.rowNumber}:`, {
          firstName: row.firstName,
          lastName: row.lastName,
          normalizedKey: key,
          donorMapSize: donorMap.size,
          uniqueDonorsSize: uniqueDonors.size
        })
        continue
      }

      // Count donor creation as success
      donorSuccessCount++

      // Skip donation creation if amount is 0 (donor is still created)
      // Amount 0 is valid for tracking donors without donations
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
    const uniqueDonorCount = uniqueDonors.size
    const totalRows = donorData.length
    const duplicateCount = totalRows - uniqueDonorCount

    // Build a clear message explaining the results
    let message = `Processed ${totalRows} row${totalRows !== 1 ? 's' : ''}`
    
    if (duplicateCount > 0) {
      message += ` (${duplicateCount} duplicate${duplicateCount !== 1 ? 's' : ''} found)`
    }
    
    message += `, created ${uniqueDonorCount} unique donor${uniqueDonorCount !== 1 ? 's' : ''}`
    
    if (totalSuccess !== uniqueDonorCount) {
      message += ` (${totalSuccess} row${totalSuccess !== 1 ? 's' : ''} processed)`
    }
    
    if (totalDonations > 0) {
      message += `, ${totalDonations} donation${totalDonations !== 1 ? 's' : ''} created`
    }
    
    if (donorsWithoutDonations > 0) {
      message += `, ${donorsWithoutDonations} donor${donorsWithoutDonations !== 1 ? 's' : ''} without donation${donorsWithoutDonations !== 1 ? 's' : ''} (amount 0)`
    }
    
    if (errors.length > 0) {
      message += `, ${errors.length} error${errors.length !== 1 ? 's' : ''}`
    }
    
    // Log detailed info for debugging
    if (duplicateCount > 0 || totalRows !== totalSuccess || uniqueDonorCount !== totalSuccess) {
      console.log(`Upload stats: ${totalRows} rows, ${uniqueDonorCount} unique donors, ${duplicateCount} duplicates, ${totalSuccess} processed, ${errors.length} errors`)
      console.log(`DonorMap size: ${donorMap.size}, UniqueDonors size: ${uniqueDonors.size}`)
      
      // Log duplicate donors for debugging
      if (duplicateCount > 0) {
        const duplicates = Array.from(uniqueDonors.entries())
          .filter(([, donor]) => donor.rowNumbers.length > 1)
          .map(([key, donor]) => ({
            key,
            name: `${donor.firstName} ${donor.lastName || '(no last name)'}`,
            rows: donor.rowNumbers,
            count: donor.rowNumbers.length
          }))
        console.log('Duplicate donors found:', duplicates)
      }
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
