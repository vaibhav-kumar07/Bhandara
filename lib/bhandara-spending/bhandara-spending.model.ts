import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/shared/db'
import { COLLECTIONS } from '@/lib/shared/constants'
import { BhandaraSpending } from './bhandara-spending.types'

export class BhandaraSpendingModel {
  private static getCollection(): Collection<BhandaraSpending> {
    return getDatabase().collection<BhandaraSpending>(COLLECTIONS.BHANDARA_SPENDINGS)
  }

  static async create(bhandaraSpending: Omit<BhandaraSpending, '_id' | 'createdAt' | 'updatedAt' | 'isLocked'>): Promise<ObjectId> {
    const collection = this.getCollection()
    const newBhandaraSpending: BhandaraSpending = {
      ...bhandaraSpending,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(newBhandaraSpending)
    return result.insertedId
  }

  static async findById(id: string): Promise<BhandaraSpending | null> {
    const collection = this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  static async findAll(): Promise<BhandaraSpending[]> {
    const collection = this.getCollection()
    return await collection.find({}).sort({ date: -1 }).toArray()
  }

  static async findByBhandara(bhandaraId: string): Promise<BhandaraSpending[]> {
    const collection = this.getCollection()
    return await collection.find({ bhandara: new ObjectId(bhandaraId) }).sort({ date: -1 }).toArray()
  }

  static async findBySpendingItem(spendingItemId: string): Promise<BhandaraSpending[]> {
    const collection = this.getCollection()
    return await collection.find({ spendingItem: new ObjectId(spendingItemId) }).sort({ date: -1 }).toArray()
  }

  static async update(id: string, updates: Partial<BhandaraSpending>, adminId: ObjectId): Promise<boolean> {
    const collection = this.getCollection()
    
    // Check if spending is locked
    const existing = await this.findById(id)
    if (!existing) return false
    if (existing.isLocked) return false

    const updateData = {
      ...updates,
      updatedAt: new Date(),
      admin: adminId
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    return result.modifiedCount > 0
  }

  static async delete(id: string): Promise<boolean> {
    const collection = this.getCollection()
    
    // Check if spending is locked
    const existing = await this.findById(id)
    if (!existing) return false
    if (existing.isLocked) return false

    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  static async unlock(id: string): Promise<boolean> {
    const collection = this.getCollection()
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isLocked: false, updatedAt: new Date() } }
    )
    return result.modifiedCount > 0
  }

  // Aggregation for populated results
  static async findAllPopulated(): Promise<any[]> {
    const collection = this.getCollection()
    return await collection.aggregate([
      {
        $lookup: {
          from: COLLECTIONS.SPENDING_ITEMS,
          localField: 'spendingItem',
          foreignField: '_id',
          as: 'spendingItemData'
        }
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
        $lookup: {
          from: COLLECTIONS.ADMINS,
          localField: 'admin',
          foreignField: '_id',
          as: 'adminData'
        }
      },
      {
        $unwind: '$spendingItemData'
      },
      {
        $unwind: '$bhandaraData'
      },
      {
        $unwind: '$adminData'
      },
      {
        $sort: { date: -1 }
      }
    ]).toArray()
  }

  static async findByBhandaraPopulated(bhandaraId: string): Promise<any[]> {
    const collection = this.getCollection()
    return await collection.aggregate([
      {
        $match: { bhandara: new ObjectId(bhandaraId) }
      },
      {
        $lookup: {
          from: COLLECTIONS.SPENDING_ITEMS,
          localField: 'spendingItem',
          foreignField: '_id',
          as: 'spendingItemData'
        }
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
        $lookup: {
          from: COLLECTIONS.ADMINS,
          localField: 'admin',
          foreignField: '_id',
          as: 'adminData'
        }
      },
      {
        $unwind: '$spendingItemData'
      },
      {
        $unwind: '$bhandaraData'
      },
      {
        $unwind: '$adminData'
      },
      {
        $sort: { date: -1 }
      }
    ]).toArray()
  }

  static async findBySpendingItemPopulated(spendingItemId: string): Promise<any[]> {
    const collection = this.getCollection()
    return await collection.aggregate([
      {
        $match: { spendingItem: new ObjectId(spendingItemId) }
      },
      {
        $lookup: {
          from: COLLECTIONS.SPENDING_ITEMS,
          localField: 'spendingItem',
          foreignField: '_id',
          as: 'spendingItemData'
        }
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
        $lookup: {
          from: COLLECTIONS.ADMINS,
          localField: 'admin',
          foreignField: '_id',
          as: 'adminData'
        }
      },
      {
        $unwind: '$spendingItemData'
      },
      {
        $unwind: '$bhandaraData'
      },
      {
        $unwind: '$adminData'
      },
      {
        $sort: { date: -1 }
      }
    ]).toArray()
  }
}