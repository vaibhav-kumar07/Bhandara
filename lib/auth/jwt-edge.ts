/**
 * Edge-compatible JWT functions for use in middleware
 * Uses jose library which works in Edge runtime
 */
import { SignJWT, jwtVerify } from 'jose'

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
 * Get the secret key for JWT operations (Edge-compatible)
 */
function getSecretKey() {
  const secret = new TextEncoder().encode(JWT_SECRET)
  return secret
}

/**
 * Verify and decode a JWT token (Edge-compatible)
 * Use this in middleware
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
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

