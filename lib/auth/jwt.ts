/**
 * Node.js JWT functions for use in server actions and API routes
 * Uses jose library for consistency with Edge runtime
 */
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
const JWT_EXPIRES_IN = '7d' // Token expires in 7 days

export interface JWTPayload {
  adminId: string
  username: string
  role: string
  iat?: number
  exp?: number
}

/**
 * Get the secret key for JWT operations
 */
function getSecretKey() {
  const secret = new TextEncoder().encode(JWT_SECRET)
  return secret
}

/**
 * Generate a JWT token for admin authentication
 * Use this in server actions
 */
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const secretKey = getSecretKey()
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey)
  
  return token
}

/**
 * Verify and decode a JWT token
 * Use this in server actions (Node.js runtime)
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secretKey = getSecretKey()
    const { payload } = await jwtVerify(token, secretKey)
    
    return {
      adminId: payload.adminId as string,
      username: payload.username as string,
      role: payload.role as string,
      iat: payload.iat as number,
      exp: payload.exp as number
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Set authentication cookie with JWT token
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true, // Cookie cannot be accessed via JavaScript
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/', // Cookie available for entire site
  })
}

/**
 * Get authentication token from cookies
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')
    return token?.value || null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

/**
 * Remove authentication cookie
 */
export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/',
  })
}

/**
 * Get current authenticated admin from cookies
 */
export async function getCurrentAdmin(): Promise<JWTPayload | null> {
  try {
    const token = await getAuthToken()
    if (!token) {
      return null
    }
    
    return await verifyToken(token)
  } catch (error) {
    console.error('Error getting current admin:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const admin = await getCurrentAdmin()
  return admin !== null
}
