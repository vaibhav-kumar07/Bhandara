import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth/jwt-edge'

// Define protected routes that require authentication
const protectedRoutes = [
  '/admin/Dashboard',
  // Add more protected admin routes here as needed
]

// Define public routes that should be accessible without authentication
const publicRoutes = [
  '/',
  '/admin/login',
  // Add more public routes here as needed
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value
  console.log('Token:', token)
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )
  
  // If it's a public route, allow access regardless of authentication
  if (isPublicRoute && !pathname.startsWith('/admin/Dashboard') && !pathname.startsWith('/admin/create')) {
    return NextResponse.next()
  }
  
  // If it's a protected route, check authentication
  if (isProtectedRoute) {
    if (!token) {
      // No token found, redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    // Verify the token (Edge-compatible)
    const payload = await verifyTokenEdge(token)
    if (!payload) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      const response = NextResponse.redirect(loginUrl)
      
      // Clear the invalid token
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      })
      
      return response
    }
    
    // Token is valid, allow access
    return NextResponse.next()
  }
  
  // Handle login page access when already authenticated
  if (pathname === '/admin/login') {
    if (token) {
      const payload = await verifyTokenEdge(token)
      if (payload) {
        // User is already authenticated, redirect to dashboard
        const dashboardUrl = new URL('/admin/Dashboard', request.url)
        return NextResponse.redirect(dashboardUrl)
      }
    }
  }
  
  // For all other routes, allow access
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}
