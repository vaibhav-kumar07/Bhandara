import { ObjectId } from 'mongodb'
import { BhandaraSpendingModel } from './bhandara-spending.model'
import { SpendingItemModel } from '../spending-item/spending-item.model'
import { BhandaraModel } from '../bhandara/bhandara.model'
import { CreateBhandaraSpendingRequest, UpdateBhandaraSpendingRequest, BhandaraSpendingResponse } from './bhandara-spending.types'
import { validateAmount, isValidObjectId, isBhandaraLocked } from '@/lib/shared/utils'
import { PAYMENT_MODE } from '@/lib/shared/constants'
import { AdminSession, isSuperAdmin } from '@/lib/shared/auth'

export class BhandaraSpendingService {
  static async createBhandaraSpending(request: CreateBhandaraSpendingRequest, admin: AdminSession): Promise<BhandaraSpendingResponse> {
    // Validation
    if (!isValidObjectId(request.spendingItemId)) {
      throw new Error('Invalid spending item ID')
    }
    if (!isValidObjectId(request.bhandaraId)) {
      throw new Error('Invalid bhandara ID')
    }
    if (!validateAmount(request.amount)) {
      throw new Error('Invalid amount')
    }
    if (!Object.values(PAYMENT_MODE).includes(request.paymentMode)) {
      throw new Error('Invalid payment mode')
    }

    // Check if spending item and bhandara exist
    const spendingItem = await SpendingItemModel.findById(request.spendingItemId)
    if (!spendingItem) {
      throw new Error('Spending item not found')
    }

    const bhandara = await BhandaraModel.findById(request.bhandaraId)
    if (!bhandara) {
      throw new Error('Bhandara not found')
    }

    // Check if bhandara is locked
    if (isBhandaraLocked(bhandara.date)) {
      throw new Error('Bhandara is locked. Cannot add spending after the event date.')
    }

    // Create bhandara spending
    const bhandaraSpendingId = await BhandaraSpendingModel.create({
      spendingItem: new ObjectId(request.spendingItemId),
      bhandara: new ObjectId(request.bhandaraId),
      amount: request.amount,
      paymentMode: request.paymentMode,
      date: new Date(),
      admin: new ObjectId(admin.id)
    })

    // Fetch and return created bhandara spending
    const bhandaraSpendings = await BhandaraSpendingModel.findAllPopulated()
    const bhandaraSpending = bhandaraSpendings.find(bs => bs._id.toString() === bhandaraSpendingId.toString())
    
    if (!bhandaraSpending) {
      throw new Error('Failed to create bhandara spending')
    }

    return this.formatBhandaraSpendingResponse(bhandaraSpending)
  }

  static async getAllBhandaraSpendings(): Promise<BhandaraSpendingResponse[]> {
    const bhandaraSpendings = await BhandaraSpendingModel.findAllPopulated()
    return bhandaraSpendings.map(spending => this.formatBhandaraSpendingResponse(spending))
  }

  static async getBhandaraSpendingsByBhandara(bhandaraId: string): Promise<BhandaraSpendingResponse[]> {
    if (!isValidObjectId(bhandaraId)) {
      throw new Error('Invalid bhandara ID')
    }

    const bhandaraSpendings = await BhandaraSpendingModel.findByBhandaraPopulated(bhandaraId)
    return bhandaraSpendings.map(spending => this.formatBhandaraSpendingResponse(spending))
  }

  static async getBhandaraSpendingsBySpendingItem(spendingItemId: string): Promise<BhandaraSpendingResponse[]> {
    if (!isValidObjectId(spendingItemId)) {
      throw new Error('Invalid spending item ID')
    }

    const bhandaraSpendings = await BhandaraSpendingModel.findBySpendingItemPopulated(spendingItemId)
    return bhandaraSpendings.map(spending => this.formatBhandaraSpendingResponse(spending))
  }

  static async getBhandaraSpendingById(id: string): Promise<BhandaraSpendingResponse | null> {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid bhandara spending ID')
    }

    const bhandaraSpendings = await BhandaraSpendingModel.findAllPopulated()
    const bhandaraSpending = bhandaraSpendings.find(bs => bs._id.toString() === id)
    
    if (!bhandaraSpending) return null
    return this.formatBhandaraSpendingResponse(bhandaraSpending)
  }

  static async updateBhandaraSpending(id: string, request: UpdateBhandaraSpendingRequest, admin: AdminSession): Promise<BhandaraSpendingResponse> {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid bhandara spending ID')
    }

    // Validation
    if (!request.note || request.note.trim().length < 5) {
      throw new Error('Note is mandatory and must be at least 5 characters')
    }

    if (request.amount !== undefined && !validateAmount(request.amount)) {
      throw new Error('Invalid amount')
    }

    if (request.paymentMode && !Object.values(PAYMENT_MODE).includes(request.paymentMode)) {
      throw new Error('Invalid payment mode')
    }

    // Check if bhandara spending exists
    const existing = await BhandaraSpendingModel.findById(id)
    if (!existing) {
      throw new Error('Bhandara spending not found')
    }

    // Check if bhandara is locked (date-based lock)
    const bhandara = await BhandaraModel.findById(existing.bhandara.toString())
    if (!bhandara) {
      throw new Error('Bhandara not found')
    }

    if (isBhandaraLocked(bhandara.date)) {
      throw new Error('Bhandara is locked. Cannot update spending after the event date.')
    }

    if (existing.isLocked && !isSuperAdmin(admin)) {
      throw new Error('Bhandara spending is locked. Only super-admin can modify locked spending.')
    }

    // Update bhandara spending
    const updated = await BhandaraSpendingModel.update(id, {
      ...(request.amount !== undefined && { amount: request.amount }),
      ...(request.paymentMode && { paymentMode: request.paymentMode }),
      note: request.note
    }, new ObjectId(admin.id))

    if (!updated) {
      throw new Error('Failed to update bhandara spending')
    }

    // Fetch and return updated bhandara spending
    const bhandaraSpendings = await BhandaraSpendingModel.findAllPopulated()
    const bhandaraSpending = bhandaraSpendings.find(bs => bs._id.toString() === id)
    
    if (!bhandaraSpending) {
      throw new Error('Failed to fetch updated bhandara spending')
    }

    return this.formatBhandaraSpendingResponse(bhandaraSpending)
  }

  static async deleteBhandaraSpending(id: string, admin: AdminSession): Promise<boolean> {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid bhandara spending ID')
    }

    // Check if bhandara spending exists
    const existing = await BhandaraSpendingModel.findById(id)
    if (!existing) {
      throw new Error('Bhandara spending not found')
    }

    // Check if bhandara is locked (date-based lock)
    const bhandara = await BhandaraModel.findById(existing.bhandara.toString())
    if (!bhandara) {
      throw new Error('Bhandara not found')
    }

    if (isBhandaraLocked(bhandara.date)) {
      throw new Error('Bhandara is locked. Cannot delete spending after the event date.')
    }

    if (existing.isLocked && !isSuperAdmin(admin)) {
      throw new Error('Bhandara spending is locked. Only super-admin can delete locked spending.')
    }

    return await BhandaraSpendingModel.delete(id)
  }

  static async unlockBhandaraSpending(id: string, admin: AdminSession): Promise<BhandaraSpendingResponse> {
    if (!isSuperAdmin(admin)) {
      throw new Error('Only super-admin can unlock bhandara spending')
    }

    if (!isValidObjectId(id)) {
      throw new Error('Invalid bhandara spending ID')
    }

    const unlocked = await BhandaraSpendingModel.unlock(id)
    if (!unlocked) {
      throw new Error('Failed to unlock bhandara spending or spending not found')
    }

    // Fetch and return unlocked bhandara spending
    const bhandaraSpendings = await BhandaraSpendingModel.findAllPopulated()
    const bhandaraSpending = bhandaraSpendings.find(bs => bs._id.toString() === id)
    
    if (!bhandaraSpending) {
      throw new Error('Failed to fetch unlocked bhandara spending')
    }

    return this.formatBhandaraSpendingResponse(bhandaraSpending)
  }

  private static formatBhandaraSpendingResponse(bhandaraSpending: any): BhandaraSpendingResponse {
    const bhandaraDate = bhandaraSpending.bhandaraData?.date ? 
      bhandaraSpending.bhandaraData.date.toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0]
    const isBhandaraDateLocked = bhandaraSpending.bhandaraData?.date ? 
      isBhandaraLocked(bhandaraSpending.bhandaraData.date) : 
      false
    
    return {
      id: bhandaraSpending._id.toString(),
      spendingItem: {
        id: bhandaraSpending.spendingItemData._id.toString(),
        name: bhandaraSpending.spendingItemData.name,
        description: bhandaraSpending.spendingItemData.description
      },
      bhandara: {
        id: bhandaraSpending.bhandaraData._id.toString(),
        name: bhandaraSpending.bhandaraData.name,
        date: bhandaraDate,
        isLocked: isBhandaraDateLocked
      },
      amount: bhandaraSpending.amount,
      paymentMode: bhandaraSpending.paymentMode,
      date: bhandaraSpending.date ? bhandaraSpending.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      note: bhandaraSpending.note,
      admin: {
        id: bhandaraSpending.adminData._id.toString(),
        username: bhandaraSpending.adminData.username
      },
      isLocked: bhandaraSpending.isLocked,
      createdAt: bhandaraSpending.createdAt ? bhandaraSpending.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: bhandaraSpending.updatedAt ? bhandaraSpending.updatedAt.toISOString() : new Date().toISOString()
    }
  }
}