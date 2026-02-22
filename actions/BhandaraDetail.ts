'use server'
import { connectToDatabase } from "@/lib/shared/db"
import { BhandaraService } from "@/lib/bhandara/bhandara.service"
import { DonorService } from "@/lib/donor/donor.service"
import { DonationService } from "@/lib/donation/donation.service"
import { BhandaraSpendingService } from "@/lib/bhandara-spending/bhandara-spending.service"
import { SpendingItemService } from "@/lib/spending-item/spending-item.service"

export async function getBhandaraDetails(bhandaraId: string) {
    try {
        await connectToDatabase()
        
        const bhandara = await BhandaraService.getBhandaraById(bhandaraId)
        if (!bhandara) {
            return {
                success: false,
                message: 'Bhandara not found'
            }
        }
        const donations = await DonationService.getDonationsByBhandara(bhandaraId)
        const bhandaraSpendings = await BhandaraSpendingService.getBhandaraSpendingsByBhandara(bhandaraId)
        const allDonors = await DonorService.getAllDonors()
        const allSpendingItems = await SpendingItemService.getAllSpendingItems()
        return {
            success: true,
            bhandara,
            donations,
            bhandaraSpendings,
            allDonors,
            allSpendingItems
        }
    } catch (error: any) {
        console.error('Error fetching bhandara details:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

