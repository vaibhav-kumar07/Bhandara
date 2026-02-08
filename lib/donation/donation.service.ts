import { ObjectId } from 'mongodb'
import { DonationModel } from './donation.model'
import { DonorModel } from '../donor/donor.model'
import { BhandaraModel } from '../bhandara/bhandara.model'
import { CreateDonationRequest, UpdateDonationRequest, DonationResponse } from './donation.types'
import { validateAmount, isValidObjectId, isBhandaraLocked } from '@/lib/shared/utils'
import { PAYMENT_STATUS, PAYMENT_MODE } from '@/lib/shared/constants'
import { AdminSession, isSuperAdmin } from '@/lib/shared/auth'

export class DonationService {
  static async createDonation(request: CreateDonationRequest, admin: AdminSession): Promise<DonationResponse> {
    // Validation
    if (!isValidObjectId(request.donorId)) {
      throw new Error('Invalid donor ID')
    }
    if (!isValidObjectId(request.bhandaraId)) {
      throw new Error('Invalid bhandara ID')
    }
    if (!validateAmount(request.amount)) {
      throw new Error('Invalid amount')
    }
    if (!Object.values(PAYMENT_MODE).includes(request.paymentMode)) {
      throw new Error('Invalid payment mode')
    }

    // Check if donor and bhandara exist
    const donor = await DonorModel.findById(request.donorId)
    if (!donor) {
      throw new Error('Donor not found')
    }

    const bhandara = await BhandaraModel.findById(request.bhandaraId)
    if (!bhandara) {
      throw new Error('Bhandara not found')
    }

    // Check if bhandara is locked
    if (isBhandaraLocked(bhandara.date)) {
      throw new Error('Bhandara is locked. Cannot add donations after the event date.')
    }

    // Create donation - always use DONE status since we don't maintain status
    const donationId = await DonationModel.create({
      donor: new ObjectId(request.donorId),
      bhandara: new ObjectId(request.bhandaraId),
      amount: request.amount,
      paymentStatus: PAYMENT_STATUS.DONE,
      paymentMode: request.paymentMode,
      date: new Date(),
      admin: new ObjectId(admin.id)
    })

    // Fetch and return created donation
    const donations = await DonationModel.findAllPopulated()
    const donation = donations.find(d => d._id.toString() === donationId.toString())
    
    if (!donation) {
      throw new Error('Failed to create donation')
    }

    return this.formatDonationResponse(donation)
  }

  static async getAllDonations(): Promise<DonationResponse[]> {
    const donations = await DonationModel.findAllPopulated()
    return donations.map(donation => this.formatDonationResponse(donation))
  }

  static async getDonationsByBhandara(bhandaraId: string): Promise<DonationResponse[]> {
    if (!isValidObjectId(bhandaraId)) {
      throw new Error('Invalid bhandara ID')
    }

    const donations = await DonationModel.findByBhandaraPopulated(bhandaraId)
    return donations.map(donation => this.formatDonationResponse(donation))
  }

  static async getDonationsByDonor(donorId: string): Promise<DonationResponse[]> {
    if (!isValidObjectId(donorId)) {
      throw new Error('Invalid donor ID')
    }

    const donations = await DonationModel.findByDonorPopulated(donorId)
    return donations.map(donation => this.formatDonationResponse(donation))
  }

  static async getDonationById(id: string): Promise<DonationResponse | null> {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid donation ID')
    }

    const donations = await DonationModel.findAllPopulated()
    const donation = donations.find(d => d._id.toString() === id)
    
    if (!donation) return null
    return this.formatDonationResponse(donation)
  }

  static async updateDonation(id: string, request: UpdateDonationRequest, admin: AdminSession): Promise<DonationResponse> {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid donation ID')
    }

    // Validation
    if (!request.note || request.note.trim().length < 5) {
      throw new Error('Note is mandatory and must be at least 5 characters')
    }

    if (request.amount !== undefined && !validateAmount(request.amount)) {
      throw new Error('Invalid amount')
    }

    if (request.paymentMode && !Object.values(PAYMENT_MODE).includes(request.paymentMode)) {
      throw new Error('Invalid payment mode')
    }

    // Check if donation exists
    const existing = await DonationModel.findById(id)
    if (!existing) {
      throw new Error('Donation not found')
    }

    // Check if bhandara is locked (date-based lock)
    const bhandara = await BhandaraModel.findById(existing.bhandara.toString())
    if (!bhandara) {
      throw new Error('Bhandara not found')
    }

    if (isBhandaraLocked(bhandara.date)) {
      throw new Error('Bhandara is locked. Cannot update donations after the event date.')
    }

    if (existing.isLocked && !isSuperAdmin(admin)) {
      throw new Error('Donation is locked. Only super-admin can modify locked donations.')
    }

    // Update donation - always keep status as DONE
    const updated = await DonationModel.update(id, {
      ...(request.amount !== undefined && { amount: request.amount }),
      paymentStatus: PAYMENT_STATUS.DONE, // Always DONE since we don't maintain status
      ...(request.paymentMode && { paymentMode: request.paymentMode }),
      note: request.note
    }, new ObjectId(admin.id))

    if (!updated) {
      throw new Error('Failed to update donation')
    }

    // Fetch and return updated donation
    const donations = await DonationModel.findAllPopulated()
    const donation = donations.find(d => d._id.toString() === id)
    
    if (!donation) {
      throw new Error('Failed to fetch updated donation')
    }

    return this.formatDonationResponse(donation)
  }

  static async unlockDonation(id: string, admin: AdminSession): Promise<DonationResponse> {
    if (!isSuperAdmin(admin)) {
      throw new Error('Only super-admin can unlock donations')
    }

    if (!isValidObjectId(id)) {
      throw new Error('Invalid donation ID')
    }

    const unlocked = await DonationModel.unlock(id)
    if (!unlocked) {
      throw new Error('Failed to unlock donation or donation not found')
    }

    // Fetch and return unlocked donation
    const donations = await DonationModel.findAllPopulated()
    const donation = donations.find(d => d._id.toString() === id)
    
    if (!donation) {
      throw new Error('Failed to fetch unlocked donation')
    }

    return this.formatDonationResponse(donation)
  }

  private static formatDonationResponse(donation: any): DonationResponse {
    const bhandaraDate = donation.bhandaraData.date.toISOString().split('T')[0]
    const isBhandaraDateLocked = isBhandaraLocked(donation.bhandaraData.date)
    
    return {
      id: donation._id.toString(),
      donor: {
        id: donation.donorData._id.toString(),
        donorName: donation.donorData.donorName,
        fatherName: donation.donorData.fatherName
      },
      bhandara: {
        id: donation.bhandaraData._id.toString(),
        name: donation.bhandaraData.name,
        date: bhandaraDate,
        isLocked: isBhandaraDateLocked
      },
      amount: donation.amount,
      paymentStatus: donation.paymentStatus,
      paymentMode: donation.paymentMode,
      date: donation.date.toISOString().split('T')[0],
      note: donation.note,
      admin: {
        id: donation.adminData._id.toString(),
        username: donation.adminData.username
      },
      isLocked: donation.isLocked,
      createdAt: donation.createdAt.toISOString(),
      updatedAt: donation.updatedAt.toISOString()
    }
  }
}
