import { DonorModel } from './donor.model'
import { CreateDonorRequest, DonorResponse } from './donor.types'
import { sanitizeString } from '@/lib/shared/utils'

export class DonorService {
  static async createDonor(request: CreateDonorRequest): Promise<DonorResponse> {
    // Sanitize and convert to uppercase
    const donorName = sanitizeString(request.donorName).toUpperCase()
    const wifeName = sanitizeString(request.wifeName).toUpperCase()

    // Validation
    if (!donorName || donorName.length < 2) {
      throw new Error('Donor name must be at least 2 characters')
    }
    if (!wifeName || wifeName.length < 2) {
      throw new Error('Wife name must be at least 2 characters')
    }

    // Create donor
    const donorId = await DonorModel.create({
      donorName,
      wifeName
    })

    // Fetch and return created donor
    const donor = await DonorModel.findById(donorId.toString())
    if (!donor) {
      throw new Error('Failed to create donor')
    }

    return {
      id: donor._id!.toString(),
      donorName: donor.donorName,
      wifeName: donor.wifeName,
      createdAt: donor.createdAt.toISOString()
    }
  }

  static async getAllDonors(): Promise<DonorResponse[]> {
    const donors = await DonorModel.findAll()
    return donors.map(donor => ({
      id: donor._id!.toString(),
      donorName: donor.donorName,
      wifeName: donor.wifeName,
      createdAt: donor.createdAt.toISOString()
    }))
  }

  static async getDonorById(id: string): Promise<DonorResponse | null> {
    const donor = await DonorModel.findById(id)
    if (!donor) return null

    return {
      id: donor._id!.toString(),
      donorName: donor.donorName,
      wifeName: donor.wifeName,
      createdAt: donor.createdAt.toISOString()
    }
  }

  static async searchDonors(donorName: string, wifeName: string): Promise<DonorResponse[]> {
    const donors = await DonorModel.findByNameCombination(donorName, wifeName)
    return donors.map(donor => ({
      id: donor._id!.toString(),
      donorName: donor.donorName,
      wifeName: donor.wifeName,
      createdAt: donor.createdAt.toISOString()
    }))
  }

  static async updateDonor(id: string, request: { donorName?: string; wifeName?: string }): Promise<DonorResponse> {
    const updateData: { donorName?: string; wifeName?: string } = {}

    if (request.donorName !== undefined) {
      const donorName = sanitizeString(request.donorName).toUpperCase()
      if (!donorName || donorName.length < 2) {
        throw new Error('Donor name must be at least 2 characters')
      }
      updateData.donorName = donorName
    }

    if (request.wifeName !== undefined) {
      const wifeName = sanitizeString(request.wifeName).toUpperCase()
      if (!wifeName || wifeName.length < 2) {
        throw new Error('Wife name must be at least 2 characters')
      }
      updateData.wifeName = wifeName
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update')
    }

    const updated = await DonorModel.update(id, updateData)
    if (!updated) {
      throw new Error('Donor not found or no changes made')
    }

    // Fetch and return updated donor
    const donor = await DonorModel.findById(id)
    if (!donor) {
      throw new Error('Failed to fetch updated donor')
    }

    return {
      id: donor._id!.toString(),
      donorName: donor.donorName,
      wifeName: donor.wifeName,
      createdAt: donor.createdAt.toISOString()
    }
  }
}
