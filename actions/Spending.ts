'use server'
import { connectToDatabase } from "@/lib/shared/db"
import { BhandaraSpendingService } from "@/lib/bhandara-spending/bhandara-spending.service"
import { getCurrentAdmin } from "@/lib/auth/jwt"
import { ADMIN_ROLE, PAYMENT_MODE } from "@/lib/shared/constants"

export async function createBhandaraSpending({
  spendingItemId,
  bhandaraId,
  amount,
  paymentMode
}: {
  spendingItemId: string
  bhandaraId: string
  amount: number
  paymentMode: typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI | typeof PAYMENT_MODE.BANK
}) {
    try {
        await connectToDatabase()
        
        const admin = await getCurrentAdmin()
        if (!admin) {
            return {
                success: false,
                message: 'Unauthorized'
            }
        }
        
        const bhandaraSpending = await BhandaraSpendingService.createBhandaraSpending({
            spendingItemId,
            bhandaraId,
            amount,
            paymentMode
        }, {
            id: admin.adminId,
            username: admin.username,
            role: admin.role as typeof ADMIN_ROLE.ADMIN | typeof ADMIN_ROLE.SUPER_ADMIN
        })
        
        return {
            success: true,
            bhandaraSpendingId: bhandaraSpending.id,
            message: 'Spending created successfully'
        }
    } catch (error: any) {
        console.error('Error creating bhandara spending:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

export async function updateBhandaraSpending({
  bhandaraSpendingId,
  amount,
  paymentMode,
  note
}: {
  bhandaraSpendingId: string
  amount?: number
  paymentMode?: typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI | typeof PAYMENT_MODE.BANK
  note: string
}) {
    try {
        await connectToDatabase()
        const admin = await getCurrentAdmin()
        if (!admin) {
            return {
                success: false,
                message: 'Unauthorized'
            }
        }
        
        const bhandaraSpending = await BhandaraSpendingService.updateBhandaraSpending(bhandaraSpendingId, {
            amount,
            paymentMode,
            note
        }, {
            id: admin.adminId,
            username: admin.username,
            role: admin.role as typeof ADMIN_ROLE.ADMIN | typeof ADMIN_ROLE.SUPER_ADMIN
        })
        
        return {
            success: true,
            bhandaraSpendingId: bhandaraSpending.id,
            message: 'Spending updated successfully'
        }

    } catch (error: any) {
        console.error('Error updating bhandara spending:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

export async function deleteBhandaraSpending(bhandaraSpendingId: string) {
    try {
        await connectToDatabase()
        const admin = await getCurrentAdmin()
        if (!admin) {
            return {
                success: false,
                message: 'Unauthorized'
            }
        }
        
        const deleted = await BhandaraSpendingService.deleteBhandaraSpending(bhandaraSpendingId, {
            id: admin.adminId,
            username: admin.username,
            role: admin.role as typeof ADMIN_ROLE.ADMIN | typeof ADMIN_ROLE.SUPER_ADMIN
        })
        
        if (!deleted) {
            return {
                success: false,
                message: 'Failed to delete spending'
            }
        }
        
        return {
            success: true,
            message: 'Spending deleted successfully'
        }

    } catch (error: any) {
        console.error('Error deleting bhandara spending:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

export async function getBhandaraSpendingsByBhandara(bhandaraId: string) {
    try {
        await connectToDatabase()
        
        const bhandaraSpendings = await BhandaraSpendingService.getBhandaraSpendingsByBhandara(bhandaraId)
        
        return {
            success: true,
            bhandaraSpendings
        }
    } catch (error: any) {
        console.error('Error fetching bhandara spendings:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred',
            bhandaraSpendings: []
        }
    }
}