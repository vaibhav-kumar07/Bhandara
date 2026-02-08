import { ObjectId } from 'mongodb'
import { PAYMENT_STATUS, PAYMENT_MODE } from '@/lib/shared/constants'

export interface Donation {
  _id?: ObjectId
  donor: ObjectId // Reference to donor
  bhandara: ObjectId // Reference to bhandara
  amount: number
  paymentStatus: typeof PAYMENT_STATUS.PENDING | typeof PAYMENT_STATUS.DONE
  paymentMode: typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI | typeof PAYMENT_MODE.BANK
  date: Date
  note?: string // MANDATORY on edit
  admin: ObjectId // Reference to admin (ID only)
  isLocked: boolean // Locked when paymentStatus = done
  createdAt: Date
  updatedAt: Date
}

export interface CreateDonationRequest {
  donorId: string
  bhandaraId: string
  amount: number
  paymentMode: typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI
  paymentStatus?: typeof PAYMENT_STATUS.PENDING | typeof PAYMENT_STATUS.DONE
}

export interface UpdateDonationRequest {
  amount?: number
  paymentStatus?: typeof PAYMENT_STATUS.PENDING | typeof PAYMENT_STATUS.DONE
  paymentMode?: typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI
  note: string // MANDATORY
}

export interface DonationResponse {
  id: string
  donor: {
    id: string
    donorName: string
    fatherName?: string
  }
  bhandara: {
    id: string
    name: string
    date: string
    isLocked?: boolean
  }
  amount: number
  paymentStatus: typeof PAYMENT_STATUS.PENDING | typeof PAYMENT_STATUS.DONE
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
