import { ensureSuperAdminExists } from '@/lib/seed/seed-admin'

export default async function AppInitializer() {
  try {
    // Ensure super-admin exists on app startup
    await ensureSuperAdminExists()
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
  
  return null // This component doesn't render anything
}