import { ObjectId } from 'mongodb'
import { ADMIN_ROLE } from '@/lib/shared/constants'

export interface Admin {
  _id?: ObjectId
  username: string
  pin: string // Hashed PIN (5 digits)
  role: typeof ADMIN_ROLE.ADMIN | typeof ADMIN_ROLE.SUPER_ADMIN
  createdAt: Date
}

export interface CreateAdminRequest {
  username: string
  pin: string // Plain PIN (5 digits, will be hashed)
  role?: typeof ADMIN_ROLE.ADMIN | typeof ADMIN_ROLE.SUPER_ADMIN
}

export interface AdminResponse {
  id: string
  username: string
  role: typeof ADMIN_ROLE.ADMIN | typeof ADMIN_ROLE.SUPER_ADMIN
  createdAt: string
}
