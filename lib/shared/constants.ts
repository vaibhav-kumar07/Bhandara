export const PAYMENT_STATUS = {
  PENDING: 'pending',
  DONE: 'done'
} as const

export const PAYMENT_MODE = {
  CASH: 'cash',
  UPI: 'upi',
  BANK: 'bank'
} as const

export const BHANDARA_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed'
} as const

export const ADMIN_ROLE = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin'
} as const

export const COLLECTIONS = {
  DONORS: 'donors',
  BHANDARAS: 'bhandaras',
  DONATIONS: 'donations',
  SPENDING_ITEMS: 'spending_items',
  BHANDARA_SPENDINGS: 'bhandara_spendings',
  ADMINS: 'admins'
} as const
