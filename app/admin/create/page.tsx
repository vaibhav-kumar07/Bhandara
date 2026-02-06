import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth/jwt'
import CreateAdminForm from './CreateAdminForm'

export default async function CreateAdminPage() {
  // Check if admin is authenticated
  const currentAdmin = await getCurrentAdmin()
  
  // If not authenticated, redirect to login
  if (!currentAdmin) {
    redirect('/admin/login')
  }

  return <CreateAdminForm />
}
