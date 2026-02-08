'use server'
import { connectToDatabase } from "@/lib/shared/db"
import { DonorService } from "@/lib/donor/donor.service"
import { DonationService } from "@/lib/donation/donation.service"

export async function createDonor({donorName, fatherName}: {donorName: string, fatherName?: string}) {
    try {
        await connectToDatabase()
        
        const donor = await DonorService.createDonor({
            donorName,
            fatherName
        })
        
        return {
            success: true,
            donorId: donor.id,
            message: 'Donor created successfully'
        }
    } catch (error: any) {
        console.error('Error creating donor:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

export async function updateDonor({ id, donorName, fatherName }: { id: string, donorName?: string, fatherName?: string }) {
    try {
        await connectToDatabase()
        
        const updateData: { donorName?: string; fatherName?: string } = {}
        if (donorName !== undefined) updateData.donorName = donorName
        if (fatherName !== undefined) updateData.fatherName = fatherName
        
        const donor = await DonorService.updateDonor(id, updateData)
        
        return {
            success: true,
            donor: donor,
            message: 'Donor updated successfully'
        }
    } catch (error: any) {
        console.error('Error updating donor:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

export async function getAllDonorsWithDonations() {
    try {
        await connectToDatabase()
        
        const donors = await DonorService.getAllDonors()
        const donorsWithDonations = await Promise.all(
            donors.map(async (donor) => {
                const donations = await DonationService.getDonationsByDonor(donor.id)
                return {
                    ...donor,
                    donations
                }
            })
        )
        
        return {
            success: true,
            donors: donorsWithDonations
        }
    } catch (error: any) {
        console.error('Error fetching donors with donations:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred',
            donors: []
        }
    }
}

export async function getDonorById(id: string) {
    try {
        await connectToDatabase()
        const donor = await DonorService.getDonorById(id)
        const donations = await DonationService.getDonationsByDonor(donor?.id || '')
        return {
            success: true,
            donor: donor,
            donations: donations
        }
    } catch (error: any) {
        console.error('Error fetching donor by id:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred',
            donor: null
        }
    }
}
