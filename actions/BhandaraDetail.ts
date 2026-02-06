'use server'
import { connectToDatabase } from "@/lib/shared/db"
import { BhandaraService } from "@/lib/bhandara/bhandara.service"
import { DonorService } from "@/lib/donor/donor.service"
import { DonationService } from "@/lib/donation/donation.service"

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
        const allDonors = await DonorService.getAllDonors()
        return {
            success: true,
            bhandara,
            donations,
            allDonors
        }
    } catch (error: any) {
        console.error('Error fetching bhandara details:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

