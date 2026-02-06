'use server'
import { connectToDatabase } from "@/lib/shared/db";
import { AdminService } from "@/lib/admin/admin.service";
import { generateToken, setAuthCookie } from '@/lib/auth/jwt';

export async function createAdmin({username, pin}: {username: string, pin: string}) {
    try {
        await connectToDatabase()
        
        const admin = await AdminService.createAdmin({
            username,
            pin
        })
        
        return {
            success: true,
            adminId: admin.id,
            message: 'Admin created successfully'
        }
    } catch (error: any) {
        console.error('Error creating admin:', error)
        return {
            success: false,
            message: error.message || 'Server error occurred'
        }
    }
}

export async function loginAdmin({username, pin}: {username: string, pin: string}) {
    try {
        await connectToDatabase()
        
        const admin = await AdminService.verifyAdmin(username, pin)
        
        if (!admin) {
            return {
                success: false,
                message: 'Invalid credentials'
            }
        }
        
        // Generate JWT token
        const token = await generateToken({
            adminId: admin.id,
            username: admin.username,
            role: admin.role
        })
        
        // Set authentication cookie
        await setAuthCookie(token)
        
        // Login successful
        return {
            success: true,
            admin: {
                id: admin.id,
                username: admin.username,
                role: admin.role
            },
            message: 'Login successful'
        }
    } catch (error) {
        console.error('Error logging in admin:', error)
        return {
            success: false,
            message: 'Server error occurred'
        }
    }
}

export async function logoutAdmin() {
    try {
        const { removeAuthCookie } = await import('@/lib/auth/jwt')
        await removeAuthCookie()
        
        return {
            success: true,
            message: 'Logged out successfully'
        }
    } catch (error) {
        console.error('Error logging out admin:', error)
        return {
            success: false,
            message: 'Server error occurred'
        }
    }
}