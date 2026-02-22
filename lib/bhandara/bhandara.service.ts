import { BhandaraModel } from './bhandara.model'
import { CreateBhandaraRequest, UpdateBhandaraStatusRequest, UpdateBhandaraRequest, BhandaraResponse } from './bhandara.types'
import { sanitizeString, isBhandaraLocked, isValidObjectId } from '@/lib/shared/utils'
import { BHANDARA_STATUS } from '@/lib/shared/constants'
import { DonationModel } from '@/lib/donation/donation.model'

export class BhandaraService {
  static async createBhandara(request: CreateBhandaraRequest): Promise<BhandaraResponse> {
    // Sanitize and capitalize only first letter
    const sanitized = sanitizeString(request.name)
    const name = sanitized.charAt(0).toUpperCase() + sanitized.slice(1).toLowerCase()

    // Validation
    if (!name || name.length < 3) {
      throw new Error('Bhandara name must be at least 3 characters')
    }

    const date = new Date(request.date)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format')
    }

    // Sanitize description if provided
    let description: string | undefined
    if (request.description) {
      description = sanitizeString(request.description).trim()
      if (description.length === 0) {
        description = undefined
      }
    }

    // Create bhandara
    const bhandaraId = await BhandaraModel.create({
      name,
      date,
      ...(description && { description })
    })

    // Fetch and return created bhandara
    const bhandara = await BhandaraModel.findById(bhandaraId.toString())
    if (!bhandara) {
      throw new Error('Failed to create bhandara')
    }

    const dateStr = bhandara.date.toISOString().split('T')[0]
    return {
      id: bhandara._id!.toString(),
      name: bhandara.name,
      date: dateStr,
      description: bhandara.description,
      status: bhandara.status,
      createdAt: bhandara.createdAt.toISOString(),
      isLocked: isBhandaraLocked(bhandara.date)
    }
  }

  static async getAllBhandaras(): Promise<BhandaraResponse[]> {
    const bhandaras = await BhandaraModel.findAll()
    return bhandaras.map(bhandara => {
      const dateStr = bhandara.date.toISOString().split('T')[0]
      return {
        id: bhandara._id!.toString(),
        name: bhandara.name,
        date: dateStr,
        description: bhandara.description,
        status: bhandara.status,
        createdAt: bhandara.createdAt.toISOString(),
        isLocked: isBhandaraLocked(bhandara.date)
      }
    })
  }

  static async getActiveBhandaras(): Promise<BhandaraResponse[]> {
    const bhandaras = await BhandaraModel.findActive()
    return bhandaras.map(bhandara => {
      const dateStr = bhandara.date.toISOString().split('T')[0]
      return {
        id: bhandara._id!.toString(),
        name: bhandara.name,
        date: dateStr,
        description: bhandara.description,
        status: bhandara.status,
        createdAt: bhandara.createdAt.toISOString(),
        isLocked: isBhandaraLocked(bhandara.date)
      }
    })
  }

  static async getBhandaraById(id: string): Promise<BhandaraResponse | null> {
    const bhandara = await BhandaraModel.findById(id)
    if (!bhandara) return null

    const dateStr = bhandara.date.toISOString().split('T')[0]
    return {
      id: bhandara._id!.toString(),
      name: bhandara.name,
      date: dateStr,
      description: bhandara.description,
      status: bhandara.status,
      createdAt: bhandara.createdAt.toISOString(),
      isLocked: isBhandaraLocked(bhandara.date)
    }
  }

  static async updateBhandaraStatus(id: string, request: UpdateBhandaraStatusRequest): Promise<BhandaraResponse> {
    // Validation
    if (!Object.values(BHANDARA_STATUS).includes(request.status)) {
      throw new Error('Invalid status')
    }

    const updated = await BhandaraModel.updateStatus(id, request.status)
    if (!updated) {
      throw new Error('Bhandara not found or status not changed')
    }

    // Fetch and return updated bhandara
    const bhandara = await BhandaraModel.findById(id)
    if (!bhandara) {
      throw new Error('Failed to fetch updated bhandara')
    }

    const dateStr = bhandara.date.toISOString().split('T')[0]
    return {
      id: bhandara._id!.toString(),
      name: bhandara.name,
      date: dateStr,
      description: bhandara.description,
      status: bhandara.status,
      createdAt: bhandara.createdAt.toISOString(),
      isLocked: isBhandaraLocked(bhandara.date)
    }
  }

  static async updateBhandara(id: string, request: UpdateBhandaraRequest): Promise<BhandaraResponse> {
    // Check if bhandara exists and is locked
    const existing = await BhandaraModel.findById(id)
    if (!existing) {
      throw new Error('Bhandara not found')
    }
    
    if (isBhandaraLocked(existing.date)) {
      throw new Error('Bhandara is locked. Cannot update information after the event date.')
    }

    const updateData: { name?: string; date?: Date; description?: string } = {}

    if (request.name !== undefined) {
      const sanitized = sanitizeString(request.name)
      const name = sanitized.charAt(0).toUpperCase() + sanitized.slice(1).toLowerCase()
      if (!name || name.length < 3) {
        throw new Error('Bhandara name must be at least 3 characters')
      }
      updateData.name = name
    }

    if (request.date !== undefined) {
      const date = new Date(request.date)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format')
      }
      updateData.date = date
    }

    if (request.description !== undefined) {
      const sanitized = sanitizeString(request.description).trim()
      updateData.description = sanitized.length > 0 ? sanitized : undefined
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update')
    }

    const updated = await BhandaraModel.update(id, updateData)
    if (!updated) {
      throw new Error('Bhandara not found or no changes made')
    }

    // Fetch and return updated bhandara
    const bhandara = await BhandaraModel.findById(id)
    if (!bhandara) {
      throw new Error('Failed to fetch updated bhandara')
    }

    const dateStr = bhandara.date.toISOString().split('T')[0]
    return {
      id: bhandara._id!.toString(),
      name: bhandara.name,
      date: dateStr,
      description: bhandara.description,
      status: bhandara.status,
      createdAt: bhandara.createdAt.toISOString(),
      isLocked: isBhandaraLocked(bhandara.date)
    }
  }

  static async deleteBhandara(id: string): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid bhandara ID')
    }

    // Check if bhandara exists
    const bhandara = await BhandaraModel.findById(id)
    if (!bhandara) {
      throw new Error('Bhandara not found')
    }

    // Check if there are any donations for this bhandara
    const donations = await DonationModel.findByBhandara(id)
    if (donations.length > 0) {
      throw new Error('Cannot delete bhandara. There are donations associated with this bhandara.')
    }

    // Delete the bhandara
    const deleted = await BhandaraModel.delete(id)
    if (!deleted) {
      throw new Error('Failed to delete bhandara')
    }
  }
}
