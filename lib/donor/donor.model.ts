import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/shared/db'
import { COLLECTIONS } from '@/lib/shared/constants'
import { Donor } from './donor.types'

export class DonorModel {
  private static getCollection(): Collection<Donor> {
    return getDatabase().collection<Donor>(COLLECTIONS.DONORS)
  }

  static async create(donor: Omit<Donor, '_id' | 'createdAt'>): Promise<ObjectId> {
    const collection = this.getCollection()
    const newDonor: Donor = {
      ...donor,
      createdAt: new Date()
    }
    
    const result = await collection.insertOne(newDonor)
    return result.insertedId
  }

  static async findById(id: string): Promise<Donor | null> {
    const collection = this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  static async findAll(): Promise<Donor[]> {
    const collection = this.getCollection()
    return await collection.find({}).sort({ donorName: 1, wifeName: 1 }).toArray()
  }

  static async findByNameCombination(donorName: string, wifeName: string): Promise<Donor[]> {
    const collection = this.getCollection()
    return await collection.find({ 
      donorName: { $regex: new RegExp(donorName, 'i') },
      wifeName: { $regex: new RegExp(wifeName, 'i') }
    }).toArray()
  }

  static async update(id: string, updates: { donorName?: string; wifeName?: string }): Promise<boolean> {
    const collection = this.getCollection()
    const updateData: any = {}
    if (updates.donorName !== undefined) updateData.donorName = updates.donorName
    if (updates.wifeName !== undefined) updateData.wifeName = updates.wifeName
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    return result.modifiedCount > 0
  }
}
