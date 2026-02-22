import { connectToDatabase } from '@/lib/shared/db'
import { AdminModel } from '@/lib/admin/admin.model'
import { ADMIN_ROLE } from '@/lib/shared/constants'
import bcrypt from 'bcryptjs'

const getDefaultSuperAdmin = () => {
  const username = process.env.DEFAULT_SUPER_ADMIN_USERNAME || 'superadmin'
  const pin = process.env.DEFAULT_SUPER_ADMIN_PIN || '12345'
  
  if (!username || !pin) {
    throw new Error('DEFAULT_SUPER_ADMIN_USERNAME and DEFAULT_SUPER_ADMIN_PIN must be set in environment variables')
  }
  
  // Validate PIN is exactly 5 digits
  if (!/^\d{5}$/.test(pin)) {
    throw new Error('DEFAULT_SUPER_ADMIN_PIN must be exactly 5 digits')
  }
  
  return {
    username,
    pin,
    role: ADMIN_ROLE.SUPER_ADMIN
  }
}

export async function seedSuperAdmin() {
  try {
    await connectToDatabase()
    
    // Get default super admin config from environment
    const defaultSuperAdmin = getDefaultSuperAdmin()
    
    // Check if any admin exists
    const existingAdmins = await AdminModel.findAll()
    
    if (existingAdmins.length === 0) {
      console.log('🌱 No admins found. Creating default super-admin...')
      
      // Hash the default PIN
      const hashedPin = await bcrypt.hash(defaultSuperAdmin.pin, 12)
      
      // Create the super-admin
      const adminId = await AdminModel.create({
        username: defaultSuperAdmin.username,
        pin: hashedPin,
        role: defaultSuperAdmin.role
      })
      
      console.log('✅ Default super-admin created successfully!')
      console.log('📋 Login credentials:')
      console.log(`   Username: ${defaultSuperAdmin.username}`)
      console.log(`   PIN: ${defaultSuperAdmin.pin}`)
      console.log('⚠️  Please change the PIN after first login for security!')
      
      return adminId
    } else {
      console.log('✅ Admin users already exist. Skipping seed.')
      return null
    }
  } catch (error) {
    console.error('❌ Error seeding super-admin:', error)
    throw error
  }
}

// Function to check if super-admin exists and create if needed
export async function ensureSuperAdminExists() {
  try {
    await connectToDatabase()
    
    // Get default super admin config from environment
    const defaultSuperAdmin = getDefaultSuperAdmin()
    
    // Check if super-admin exists
    const superAdmin = await AdminModel.findByUsername(defaultSuperAdmin.username)
    
    if (!superAdmin) {
      console.log('🔍 Super-admin not found. Creating...')
      return await seedSuperAdmin()
    } else {
      console.log('✅ Super-admin exists.')
      return superAdmin._id
    }
  } catch (error) {
    console.error('❌ Error ensuring super-admin exists:', error)
    throw error
  }
}