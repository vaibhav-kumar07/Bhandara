import { connectToDatabase, getDatabase } from '../lib/shared/db'
import { COLLECTIONS } from '../lib/shared/constants'

// Set environment variables manually
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://viranshk7_db_user:33690v72315@bhandaracluster.u27oal2.mongodb.net/Bhandara?appName=BhandaraCluster'

async function fixSpendingItems() {
  try {
    await connectToDatabase()
    const db = getDatabase()
    
    const spendingItemsCollection = db.collection(COLLECTIONS.SPENDING_ITEMS)
    const bhandaraSpendingsCollection = db.collection(COLLECTIONS.BHANDARA_SPENDINGS)
    
    console.log('🔧 Fixing spending items without createdAt/updatedAt...')
    
    // Fix spending items
    const spendingItemsResult = await spendingItemsCollection.updateMany(
      {
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      },
      {
        $set: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    )
    
    console.log(`✅ Fixed ${spendingItemsResult.modifiedCount} spending items`)
    
    // Fix bhandara spendings
    const bhandaraSpendingsResult = await bhandaraSpendingsCollection.updateMany(
      {
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } },
          { date: { $exists: false } }
        ]
      },
      {
        $set: {
          createdAt: new Date(),
          updatedAt: new Date(),
          date: new Date()
        }
      }
    )
    
    console.log(`✅ Fixed ${bhandaraSpendingsResult.modifiedCount} bhandara spendings`)
    
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    process.exit(0)
  }
}

fixSpendingItems()