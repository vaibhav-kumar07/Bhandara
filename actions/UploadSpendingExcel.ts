'use server'
import { connectToDatabase, getDatabase } from '@/lib/shared/db'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import { COLLECTIONS, PAYMENT_MODE } from '@/lib/shared/constants'
import { ObjectId } from 'mongodb'
import { BhandaraModel } from '@/lib/bhandara/bhandara.model'
import { isBhandaraLocked } from '@/lib/shared/utils'

export interface ProcessedSpendingData {
  spendingItem: string
  amount: number
  rowNumber: number
}

export async function bulkUploadSpendings(
  spendingData: ProcessedSpendingData[],
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

    // Validate bhandara ID format
    if (!ObjectId.isValid(bhandaraId)) {
      return {
        success: false,
        message: 'Invalid bhandara ID format',
        results: { success: 0, failed: 0, errors: ['Invalid bhandara ID format'] }
      }
    }

    // Validate bhandara exists
    const bhandara = await BhandaraModel.findById(bhandaraId)
    if (!bhandara) {
      return {
        success: false,
        message: 'Bhandara not found',
        results: { success: 0, failed: 0, errors: ['Bhandara not found'] }
      }
    }

    console.log(`Processing spending upload for bhandara: ${bhandara.name} (${bhandaraId})`)

    if (isBhandaraLocked(bhandara.date)) {
      return {
        success: false,
        message: 'Bhandara is locked',
        results: { success: 0, failed: 0, errors: ['Bhandara is locked. Cannot add spending after the event date.'] }
      }
    }

    if (!spendingData || spendingData.length === 0) {
      return {
        success: false,
        message: 'No data provided',
        results: { success: 0, failed: 0, errors: ['No valid data to upload'] }
      }
    }

    const db = getDatabase()
    const spendingItemsCollection = db.collection(COLLECTIONS.SPENDING_ITEMS)
    const bhandaraSpendingsCollection = db.collection(COLLECTIONS.BHANDARA_SPENDINGS)

    // Verify collections exist and are accessible
    try {
      await spendingItemsCollection.findOne({}, { limit: 1 })
      await bhandaraSpendingsCollection.findOne({}, { limit: 1 })
    } catch (error: any) {
      console.error('Database collection access error:', error)
      return {
        success: false,
        message: 'Database access error',
        results: { success: 0, failed: 0, errors: ['Failed to access database collections'] }
      }
    }

    const errors: string[] = []

    // Prepare spending item map and bulk operations
    const spendingItemMap = new Map<string, ObjectId>()
    const spendingItemBulkOps: any[] = []
    const uniqueSpendingItems = new Map<string, { name: string; rowNumbers: number[] }>()

    // Collect unique spending items
    for (const row of spendingData) {
      const normalizedName = row.spendingItem.trim().toLowerCase()
      
      if (!uniqueSpendingItems.has(normalizedName)) {
        uniqueSpendingItems.set(normalizedName, { 
          name: row.spendingItem.trim(), // Store original case
          rowNumbers: [row.rowNumber] 
        })
      } else {
        // Track all row numbers for this spending item
        uniqueSpendingItems.get(normalizedName)!.rowNumbers.push(row.rowNumber)
      }
    }

    // Find existing spending items in bulk
    if (uniqueSpendingItems.size > 0) {
      try {
        const spendingItemQueries = Array.from(uniqueSpendingItems.values()).map(item => ({
          name: { $regex: new RegExp(`^${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        }))
        
        const existingSpendingItems = await spendingItemsCollection.find({
          $or: spendingItemQueries
        }).toArray()

        // Map existing spending items (case-insensitive matching)
        existingSpendingItems.forEach(item => {
          const normalizedName = item.name.toLowerCase()
          spendingItemMap.set(normalizedName, item._id)
        })
      } catch (findError: any) {
        console.error('Error finding existing spending items:', findError)
        throw new Error(`Failed to find existing spending items: ${findError.message}`)
      }
    }

    // Prepare upsert operations for new spending items
    for (const [key, item] of uniqueSpendingItems.entries()) {
      if (!spendingItemMap.has(key)) {
        spendingItemBulkOps.push({
          updateOne: {
            filter: { 
              name: { $regex: new RegExp(`^${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
            },
            update: {
              $setOnInsert: {
                name: item.name,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            },
            upsert: true
          }
        })
      }
    }

    // Execute bulk write for spending items
    if (spendingItemBulkOps.length > 0) {
      try {
        const spendingItemResult = await spendingItemsCollection.bulkWrite(spendingItemBulkOps, { ordered: false })
        
        // Fetch newly created spending items from upsertedIds
        if (spendingItemResult.upsertedCount > 0 && spendingItemResult.upsertedIds) {
          const upsertedIds = Object.values(spendingItemResult.upsertedIds).filter(id => id) as ObjectId[]
          if (upsertedIds.length > 0) {
            const newSpendingItems = await spendingItemsCollection.find({
              _id: { $in: upsertedIds }
            }).toArray()
            
            newSpendingItems.forEach(item => {
              const normalizedName = item.name.toLowerCase()
              spendingItemMap.set(normalizedName, item._id)
            })
          }
        }
      } catch (bulkError: any) {
        console.error('Error in bulk write for spending items:', bulkError)
        throw new Error(`Failed to create spending items: ${bulkError.message}`)
      }
    }

    // Final fetch to ensure all spending items are in the map
    if (uniqueSpendingItems.size > 0) {
      try {
        // Get all unique spending items that aren't in spendingItemMap yet
        const missingSpendingItems = Array.from(uniqueSpendingItems.entries())
          .filter(([key]) => !spendingItemMap.has(key))
          .map(([, item]) => item)
        
        if (missingSpendingItems.length > 0) {
          const spendingItemQueries = missingSpendingItems.map(item => ({
            name: { $regex: new RegExp(`^${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
          }))
          
          if (spendingItemQueries.length > 0) {
            const allSpendingItems = await spendingItemsCollection.find({
              $or: spendingItemQueries
            }).toArray()

            allSpendingItems.forEach(item => {
              const normalizedName = item.name.toLowerCase()
              if (!spendingItemMap.has(normalizedName)) {
                spendingItemMap.set(normalizedName, item._id)
              }
            })
          }
        }
      } catch (findError: any) {
        console.error('Error in final spending item fetch:', findError)
      }
    }

    // Prepare bulk insert for bhandara spendings (skip if amount is 0)
    const bhandaraSpendingDocs: any[] = []
    const adminId = new ObjectId(admin.adminId)
    const bhandaraObjectId = new ObjectId(bhandaraId)
    const now = new Date()
    
    let spendingItemSuccessCount = 0
    let bhandaraSpendingSuccessCount = 0

    for (const row of spendingData) {
      const normalizedName = row.spendingItem.trim().toLowerCase()
      const spendingItemId = spendingItemMap.get(normalizedName)
      
      if (!spendingItemId) {
        errors.push(`Row ${row.rowNumber}: Failed to find or create spending item "${row.spendingItem}"`)
        console.error(`Spending item lookup failed for row ${row.rowNumber}:`, {
          spendingItem: row.spendingItem,
          normalizedKey: normalizedName,
          spendingItemMapSize: spendingItemMap.size,
          uniqueSpendingItemsSize: uniqueSpendingItems.size
        })
        continue
      }

      // Count spending item creation as success
      spendingItemSuccessCount++

      // Skip bhandara spending creation if amount is 0 (spending item is still created)
      if (row.amount === 0) {
        continue
      }

      // Check if bhandara spending already exists for this spending item
      const existingBhandaraSpending = await bhandaraSpendingsCollection.findOne({
        spendingItem: spendingItemId,
        bhandara: bhandaraObjectId
      })

      if (existingBhandaraSpending) {
        errors.push(`Row ${row.rowNumber}: Spending record already exists for "${row.spendingItem}" in this bhandara`)
        continue
      }

      // Validate all required fields before adding to batch
      if (!spendingItemId || !bhandaraObjectId || !adminId) {
        errors.push(`Row ${row.rowNumber}: Missing required IDs for database insertion`)
        continue
      }

      // Validate amount is a valid number
      if (typeof row.amount !== 'number' || isNaN(row.amount)) {
        errors.push(`Row ${row.rowNumber}: Invalid amount value`)
        continue
      }

      bhandaraSpendingDocs.push({
        spendingItem: spendingItemId,
        bhandara: bhandaraObjectId,
        amount: row.amount,
        paymentMode: PAYMENT_MODE.CASH,
        note: `Uploaded from Excel - Row ${row.rowNumber}`,
        admin: adminId,
        isLocked: false,
        createdAt: now,
        updatedAt: now
      })
    }

    // Execute bulk insert for bhandara spendings
    if (bhandaraSpendingDocs.length > 0) {
      try {
        console.log(`Attempting to insert ${bhandaraSpendingDocs.length} bhandara spending records`)
        const bhandaraSpendingResult = await bhandaraSpendingsCollection.insertMany(bhandaraSpendingDocs, { ordered: false })
        bhandaraSpendingSuccessCount = bhandaraSpendingResult.insertedCount
        console.log(`Successfully inserted ${bhandaraSpendingSuccessCount} bhandara spending records`)
      } catch (error: any) {
        console.error('Error during bhandara spending bulk insert:', error)
        // Some bhandara spendings might have failed (e.g., duplicate key)
        if (error.writeErrors) {
          bhandaraSpendingSuccessCount = bhandaraSpendingDocs.length - error.writeErrors.length
          console.log(`Partial success: ${bhandaraSpendingSuccessCount} inserted, ${error.writeErrors.length} failed`)
          error.writeErrors.forEach((writeError: any) => {
            const originalRow = spendingData[writeError.index]
            errors.push(`Row ${originalRow?.rowNumber || writeError.index + 1}: ${writeError.errmsg || 'Failed to create bhandara spending'}`)
            console.error(`Write error for row ${originalRow?.rowNumber}:`, writeError)
          })
        } else {
          console.error('Bulk insert failed completely:', error)
          errors.push(`Bulk insert failed: ${error.message || 'Unknown error'}`)
          // Don't throw here, let the function continue and return the error
        }
      }
    }

    const totalSuccess = spendingItemSuccessCount
    const totalBhandaraSpendings = bhandaraSpendingSuccessCount
    const spendingItemsWithoutAmount = spendingItemSuccessCount - bhandaraSpendingSuccessCount
    const uniqueSpendingItemCount = uniqueSpendingItems.size
    const totalRows = spendingData.length
    const duplicateCount = totalRows - uniqueSpendingItemCount

    // Build a clear message explaining the results
    let message = `Processed ${totalRows} row${totalRows !== 1 ? 's' : ''}`
    
    if (duplicateCount > 0) {
      message += ` (${duplicateCount} duplicate${duplicateCount !== 1 ? 's' : ''} found)`
    }
    
    message += `, created ${uniqueSpendingItemCount} unique spending item${uniqueSpendingItemCount !== 1 ? 's' : ''}`
    
    if (totalSuccess !== uniqueSpendingItemCount) {
      message += ` (${totalSuccess} row${totalSuccess !== 1 ? 's' : ''} processed)`
    }
    
    if (totalBhandaraSpendings > 0) {
      message += `, ${totalBhandaraSpendings} bhandara spending${totalBhandaraSpendings !== 1 ? 's' : ''} created`
    }
    
    if (spendingItemsWithoutAmount > 0) {
      message += `, ${spendingItemsWithoutAmount} spending item${spendingItemsWithoutAmount !== 1 ? 's' : ''} without amount (amount 0)`
    }
    
    if (errors.length > 0) {
      message += `, ${errors.length} error${errors.length !== 1 ? 's' : ''}`
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
    console.error('Error processing bulk spending upload:', error)
    const errorMessage = error?.message || error?.toString() || 'Failed to process bulk spending upload'
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