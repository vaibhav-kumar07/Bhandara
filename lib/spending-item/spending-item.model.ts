import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/shared/db'
import { COLLECTIONS } from '@/lib/shared/constants'
import { SpendingItem } from './spending-item.types'

export class SpendingItemModel {
  private static getCollection(): Collection<SpendingItem> {
    return getDatabase().collection<SpendingItem>(COLLECTIONS.SPENDING_ITEMS)
  }

  static async create(spendingItem: Omit<SpendingItem, '_id' | 'createdAt' | 'updatedAt'>): Promise<ObjectId> {
    const collection = this.getCollection()
    const newSpendingItem: SpendingItem = {
      ...spendingItem,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(newSpendingItem)
    return result.insertedId
  }

  static async findById(id: string): Promise<SpendingItem | null> {
    const collection = this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  static async findAll(): Promise<SpendingItem[]> {
    const collection = this.getCollection()
    return await collection.find({}).sort({ name: 1 }).toArray()
  }

  static async findByName(name: string): Promise<SpendingItem | null> {
    const collection = this.getCollection()
    return await collection.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    })
  }

  static async findByNameCombination(name: string): Promise<SpendingItem | null> {
    const collection = this.getCollection()
    const cleanName = name.trim().toLowerCase()
    
    return await collection.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${cleanName}$`, 'i') } }
      ]
    })
  }

  static async update(id: string, updates: Partial<SpendingItem>): Promise<boolean> {
    const collection = this.getCollection()
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    return result.modifiedCount > 0
  }

  static async delete(id: string): Promise<boolean> {
    const collection = this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }
}