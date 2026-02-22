import { ObjectId } from 'mongodb'
import { BHANDARA_STATUS } from '@/lib/shared/constants'

export interface Bhandara {
  _id?: ObjectId
  name: string
  date: Date
  description?: string // Optional description
  status: typeof BHANDARA_STATUS.ACTIVE | typeof BHANDARA_STATUS.CLOSED
  createdAt: Date
}

export interface CreateBhandaraRequest {
  name: string
  date: string // ISO date string
  description?: string // Optional description
}

export interface UpdateBhandaraStatusRequest {
  status: typeof BHANDARA_STATUS.ACTIVE | typeof BHANDARA_STATUS.CLOSED
}

export interface UpdateBhandaraRequest {
  name?: string
  date?: string // ISO date string
  description?: string // Optional description
}

export interface BhandaraResponse {
  id: string
  name: string
  date: string
  description?: string // Optional description
  status: typeof BHANDARA_STATUS.ACTIVE | typeof BHANDARA_STATUS.CLOSED
  createdAt: string
  isLocked?: boolean // Locked if date is in the past
}
