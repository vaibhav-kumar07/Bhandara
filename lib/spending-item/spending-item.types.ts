import { ObjectId } from 'mongodb'

export interface SpendingItem {
  _id?: ObjectId
  name: string // e.g., "Food", "Decorations", "Supplies"
  description?: string // Additional details about this spending category
  createdAt: Date
  updatedAt: Date
}

export interface CreateSpendingItemRequest {
  name: string
  description?: string
}

export interface UpdateSpendingItemRequest {
  name?: string
  description?: string
}

export interface SpendingItemResponse {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}