'use server'
import { connectToDatabase } from "@/lib/shared/db"
import { DonationService } from "@/lib/donation/donation.service"
import { getCurrentAdmin } from "@/lib/auth/jwt"
import {    ADMIN_ROLE, PAYMENT_MODE, PAYMENT_STATUS } from "@/lib/shared/constants"

export async function createDonation({
  donorId,
  bhandaraId,
  amount,
  paymentMode
}: {
  donorId: string
  bhandaraId: string
  amount: number
  paymentMode: typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI
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
        const donation = await DonationService.createDonation({
            donorId,
            bhandaraId,
            amount,
            paymentMode,
            paymentStatus: PAYMENT_STATUS.DONE
        }, {
            id: admin.adminId,
            username: admin.username,
            role: admin.role as typeof ADMIN_ROLE.ADMIN | typeof ADMIN_ROLE.SUPER_ADMIN
        })
        
        return {
            success: true,
            donationId: donation.id,
            message: 'Donation created successfully'
        }
    } catch (error: any) {
        console.error('Error creating donation:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

export async function updateDonation({
  donationId,
  amount,
  paymentMode,
  note
}: {
  donationId: string
  amount: number
  paymentMode: typeof PAYMENT_MODE.CASH | typeof PAYMENT_MODE.UPI
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
        const donation = await DonationService.updateDonation(donationId, {
            amount,
            paymentMode,
            paymentStatus: PAYMENT_STATUS.DONE,
            note: note || ''
        }, {
            id: admin.adminId,
            username: admin.username,
            role: admin.role as typeof ADMIN_ROLE.ADMIN | typeof ADMIN_ROLE.SUPER_ADMIN
        })
        return {
            success: true,
            donationId: donation.id,
            message: 'Donation updated successfully'
        }

    } catch (error: any) {
        console.error('Error updating donation:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}