export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ')
}

export function validateAmount(amount: number): boolean {
  return typeof amount === 'number' && amount > 0 && Number.isFinite(amount)
}

/**
 * Check if a bhandara is locked (date is in the past)
 * Compares the bhandara date with current date (at start of day)
 */
export function isBhandaraLocked(bhandaraDate: string | Date): boolean {
  const date = typeof bhandaraDate === 'string' ? new Date(bhandaraDate) : bhandaraDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const bhandaraDateOnly = new Date(date)
  bhandaraDateOnly.setHours(0, 0, 0, 0)
  
  return bhandaraDateOnly < today
}