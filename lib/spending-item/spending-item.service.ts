import { ObjectId } from 'mongodb'
import { SpendingItemModel } from './spending-item.model'
import { CreateSpendingItemRequest, UpdateSpendingItemRequest, SpendingItemResponse } from './spending-item.types'
import { isValidObjectId, sanitizeString } from '@/lib/shared/utils'

export class SpendingItemService {
  static async createSpendingItem(request: CreateSpendingItemRequest): Promise<SpendingItemResponse> {
    // Validation
    if (!request.name || request.name.trim().length < 2) {
      throw new Error('Spending item name is required and must be at least 2 characters')
    }

    const cleanName = sanitizeString(request.name)
    
    // Check if spending item already exists
    const existing = await SpendingItemModel.findByNameCombination(cleanName)
    if (existing) {
      throw new Error('A spending item with this name already exists')
    }

    // Create spending item
    const spendingItemId = await SpendingItemModel.create({
      name: cleanName,
      description: request.description ? sanitizeString(request.description) : undefined
    })

    // Fetch and return created spending item
    const spendingItem = await SpendingItemModel.findById(spendingItemId.toString())
    
    if (!spendingItem) {
      throw new Error('Failed to create spending item')
    }

    return this.formatSpendingItemResponse(spendingItem)
  }

  static async getAllSpendingItems(): Promise<SpendingItemResponse[]> {
    const spendingItems = await SpendingItemModel.findAll()
    return spendingItems.map(item => this.formatSpendingItemResponse(item))
  }

  static async getSpendingItemById(id: string): Promise<SpendingItemResponse | null> {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid spending item ID')
    }

    const spendingItem = await SpendingItemModel.findById(id)
    if (!spendingItem) return null

    return this.formatSpendingItemResponse(spendingItem)
  }

  static async updateSpendingItem(id: string, request: UpdateSpendingItemRequest): Promise<SpendingItemResponse> {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid spending item ID')
    }

    // Check if spending item exists
    const existing = await SpendingItemModel.findById(id)
    if (!existing) {
      throw new Error('Spending item not found')
    }

    // Validation
    if (request.name !== undefined) {
      if (!request.name || request.name.trim().length < 2) {
        throw new Error('Spending item name must be at least 2 characters')
      }

      const cleanName = sanitizeString(request.name)
      
      // Check if another spending item with this name exists
      const duplicate = await SpendingItemModel.findByNameCombination(cleanName)
      if (duplicate && duplicate._id?.toString() !== id) {
        throw new Error('A spending item with this name already exists')
      }
    }

    // Update spending item
    const updated = await SpendingItemModel.update(id, {
      ...(request.name !== undefined && { name: sanitizeString(request.name) }),
      ...(request.description !== undefined && { 
        description: request.description ? sanitizeString(request.description) : undefined 
      })
    })

    if (!updated) {
      throw new Error('Failed to update spending item')
    }

    // Fetch and return updated spending item
    const spendingItem = await SpendingItemModel.findById(id)
    
    if (!spendingItem) {
      throw new Error('Failed to fetch updated spending item')
    }

    return this.formatSpendingItemResponse(spendingItem)
  }

  static async deleteSpendingItem(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid spending item ID')
    }

    // Check if spending item exists
    const existing = await SpendingItemModel.findById(id)
    if (!existing) {
      throw new Error('Spending item not found')
    }

    // TODO: Check if spending item is used in any bhandara spendings
    // For now, we'll allow deletion - in production you might want to prevent this

    return await SpendingItemModel.delete(id)
  }

  private static formatSpendingItemResponse(spendingItem: any): SpendingItemResponse {
    return {
      id: spendingItem._id.toString(),
      name: spendingItem.name,
      description: spendingItem.description,
      createdAt: spendingItem.createdAt.toISOString(),
      updatedAt: spendingItem.updatedAt.toISOString()
    }
  }
}