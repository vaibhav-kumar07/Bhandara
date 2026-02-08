import { DonorModel } from './donor.model'
import { CreateDonorRequest, DonorResponse } from './donor.types'
import { sanitizeString } from '@/lib/shared/utils'

export class DonorService {
  static async createDonor(request: CreateDonorRequest): Promise<DonorResponse> {
    // Sanitize (keep original case)
    const donorName = sanitizeString(request.donorName)
    const fatherName = request.fatherName ? sanitizeString(request.fatherName) : undefined

    // Validation
    if (!donorName || donorName.length < 2) {
      throw new Error('Donor name must be at least 2 characters')
    }
    if (fatherName && fatherName.length < 2) {
      throw new Error('Father name must be at least 2 characters if provided')
    }

    // Create donor
    const donorId = await DonorModel.create({
      donorName,
      ...(fatherName && { fatherName })
    })

    // Fetch and return created donor
    const donor = await DonorModel.findById(donorId.toString())
    if (!donor) {
      throw new Error('Failed to create donor')
    }

    return {
      id: donor._id!.toString(),
      donorName: donor.donorName,
      fatherName: donor.fatherName,
      createdAt: donor.createdAt.toISOString()
    }
  }

  static async getAllDonors(): Promise<DonorResponse[]> {
    const donors = await DonorModel.findAll()
    return donors.map(donor => ({
      id: donor._id!.toString(),
      donorName: donor.donorName,
      fatherName: donor.fatherName,
      createdAt: donor.createdAt.toISOString()
    }))
  }

  static async getDonorById(id: string): Promise<DonorResponse | null> {
    const donor = await DonorModel.findById(id)
    if (!donor) return null

    return {
      id: donor._id!.toString(),
      donorName: donor.donorName,
      fatherName: donor.fatherName,
      createdAt: donor.createdAt.toISOString()
    }
  }

  static async searchDonors(donorName: string, fatherName?: string): Promise<DonorResponse[]> {
    const donors = await DonorModel.findByNameCombination(donorName, fatherName)
    return donors.map(donor => ({
      id: donor._id!.toString(),
      donorName: donor.donorName,
      fatherName: donor.fatherName,
      createdAt: donor.createdAt.toISOString()
    }))
  }

  static async updateDonor(id: string, request: { donorName?: string; fatherName?: string }): Promise<DonorResponse> {
    const updateData: { donorName?: string; fatherName?: string } = {}

    if (request.donorName !== undefined) {
      const donorName = sanitizeString(request.donorName)
      if (!donorName || donorName.length < 2) {
        throw new Error('Donor name must be at least 2 characters')
      }
      updateData.donorName = donorName
    }

    if (request.fatherName !== undefined) {
      if (request.fatherName === '' || request.fatherName === null) {
        // Allow clearing father name
        updateData.fatherName = undefined
      } else {
        const fatherName = sanitizeString(request.fatherName)
        if (fatherName.length < 2) {
          throw new Error('Father name must be at least 2 characters if provided')
        }
        updateData.fatherName = fatherName
      }
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
      fatherName: donor.fatherName,
      createdAt: donor.createdAt.toISOString()
    }
  }
}
