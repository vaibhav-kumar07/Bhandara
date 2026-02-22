import { ObjectId } from 'mongodb'
import { PAYMENT_MODE } from '@/lib/shared/constants'

export interface BhandaraSpending {
  _id?: ObjectId
  spendingItem: ObjectId // Reference to spending item
  bhandara: ObjectId // Reference to bhandara
  amount: number
  paymentMode: typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI | typeof PAYMENT_MODE.BANK
  date: Date
  note?: string // MANDATORY on edit
  admin: ObjectId // Reference to admin (ID only)
  isLocked: boolean // Locked when bhandara is locked
  createdAt: Date
  updatedAt: Date
}

export interface CreateBhandaraSpendingRequest {
  spendingItemId: string
  bhandaraId: string
  amount: number
  paymentMode: typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI | typeof PAYMENT_MODE.BANK
}

export interface UpdateBhandaraSpendingRequest {
  amount?: number
  paymentMode?: typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI | typeof PAYMENT_MODE.BANK
  note: string // MANDATORY
}

export interface BhandaraSpendingResponse {
  id: string
  spendingItem: {
    id: string
    name: string
    description?: string
  }
  bhandara: {
    id: string
    name: string
    date: string
    isLocked?: boolean
  }
  amount: number
  paymentMode: typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI | typeof PAYMENT_MODE.BANK
  date: string
  note?: string
  admin: {
    id: string
    username: string
  }
  isLocked: boolean
  createdAt: string
  updatedAt: string
}