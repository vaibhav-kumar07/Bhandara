import { seedSuperAdmin } from './seed-admin'

export async function runSeed() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // Seed super-admin
    await seedSuperAdmin()
    
    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    throw error
  }
}

// Export individual seed functions
export { seedSuperAdmin, ensureSuperAdminExists } from './seed-admin'