'use server'
import { connectToDatabase } from "@/lib/shared/db"
import { SpendingItemService } from "@/lib/spending-item/spending-item.service"
import { BhandaraSpendingService } from "@/lib/bhandara-spending/bhandara-spending.service"
import { getCurrentAdmin } from "@/lib/auth/jwt"
import { ADMIN_ROLE, PAYMENT_MODE } from "@/lib/shared/constants"

export async function createSpendingItem({
  name,
  description
}: {
  name: string
  description?: string
}) {
    try {
        await connectToDatabase()
        
        const spendingItem = await SpendingItemService.createSpendingItem({
            name,
            description
        })
        
        return {
            success: true,
            spendingItemId: spendingItem.id,
            message: 'Spending item created successfully'
        }
    } catch (error: any) {
        console.error('Error creating spending item:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

export async function updateSpendingItem({
  spendingItemId,
  name,
  description
}: {
  spendingItemId: string
  name?: string
  description?: string
}) {
    try {
        await connectToDatabase()
        
        const spendingItem = await SpendingItemService.updateSpendingItem(spendingItemId, {
            name,
            description
        })
        
        return {
            success: true,
            spendingItemId: spendingItem.id,
            message: 'Spending item updated successfully'
        }

    } catch (error: any) {
        console.error('Error updating spending item:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

export async function deleteSpendingItem(spendingItemId: string) {
    try {
        await connectToDatabase()
        
        const deleted = await SpendingItemService.deleteSpendingItem(spendingItemId)
        
        if (!deleted) {
            return {
                success: false,
                message: 'Failed to delete spending item'
            }
        }
        
        return {
            success: true,
            message: 'Spending item deleted successfully'
        }

    } catch (error: any) {
        console.error('Error deleting spending item:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

export async function getAllSpendingItems() {
    try {
        await connectToDatabase()
        
        const spendingItems = await SpendingItemService.getAllSpendingItems()
        
        return {
            success: true,
            spendingItems
        }
    } catch (error: any) {
        console.error('Error fetching spending items:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred',
            spendingItems: []
        }
    }
}

export async function createSpendingItemWithBhandaraSpending({
  name,
  bhandaraId,
  amount
}: {
  name: string
  bhandaraId: string
  amount: number
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

        // Step 1: Create the spending item
        const spendingItem = await SpendingItemService.createSpendingItem({
            name
        })
        
        // Step 2: Create the bhandara spending with default cash payment mode
        const bhandaraSpending = await BhandaraSpendingService.createBhandaraSpending({
            spendingItemId: spendingItem.id,
            bhandaraId,
            amount,
            paymentMode: PAYMENT_MODE.CASH
        }, {
            id: admin.adminId,
            username: admin.username,
            role: admin.role as typeof ADMIN_ROLE.ADMIN | typeof ADMIN_ROLE.SUPER_ADMIN
        })
        
        return {
            success: true,
            spendingItemId: spendingItem.id,
            bhandaraSpendingId: bhandaraSpending.id,
            message: 'Spending created successfully'
        }
    } catch (error: any) {
        console.error('Error creating spending item with bhandara spending:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}