import bcrypt from 'bcryptjs'
import { AdminModel } from './admin.model'
import { CreateAdminRequest, AdminResponse } from './admin.types'
import { ADMIN_ROLE } from '../shared/constants'

export class AdminService {
  static async createAdmin(request: CreateAdminRequest): Promise<AdminResponse> {
    // Validation
    if (!request.username || request.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters')
    }
    if (!request.pin || request.pin.length !== 5) {
      throw new Error('PIN must be exactly 5 digits')
    }
    if (!/^\d{5}$/.test(request.pin)) {
      throw new Error('PIN must contain exactly 5 digits')
    }

    // Convert username to uppercase
    const username = request.username.trim().toUpperCase()

    // Check if admin already exists
    const existingAdmin = await AdminModel.findByUsername(username)
    if (existingAdmin) {
      throw new Error('Username already exists')
    }

    // Hash the PIN
    const saltRounds = 12
    const hashedPin = await bcrypt.hash(request.pin, saltRounds)

    // Create admin
    const adminId = await AdminModel.create({
      username,
      pin: hashedPin,
      role: request.role || ADMIN_ROLE.ADMIN
    })

    // Fetch and return created admin
    const admin = await AdminModel.findById(adminId.toString())
    if (!admin) {
      throw new Error('Failed to create admin')
    }

    return {
      id: admin._id!.toString(),
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt.toISOString()
    }
  }

  static async verifyAdmin(username: string, pin: string): Promise<AdminResponse | null> {
    // Convert username to uppercase for lookup
    const usernameUpper = username.trim().toUpperCase()
    
    // Find admin by username
    const admin = await AdminModel.findByUsername(usernameUpper)
    if (!admin) {
      return null
    }

    // Verify PIN
    const isPinValid = await bcrypt.compare(pin, admin.pin)
    if (!isPinValid) {
      return null
    }

    return {
      id: admin._id!.toString(),
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt.toISOString()
    }
  }

  static async getAdminById(id: string): Promise<AdminResponse | null> {
    const admin = await AdminModel.findById(id)
    if (!admin) return null

    return {
      id: admin._id!.toString(),
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt.toISOString()
    }
  }

  static async getAllAdmins(): Promise<AdminResponse[]> {
    const admins = await AdminModel.findAll()
    return admins.map(admin => ({
      id: admin._id!.toString(),
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt.toISOString()
    }))
  }
}

