import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

// List of paths that don't require authentication
const publicPaths = ["/login", "/api/auth/login", "/api/auth/logout", "/public"]

// Function to verify JWT token
async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      id: payload.userId as number,
      username: payload.username as string,
      role: payload.role as string,
    }
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to public paths
  if (publicPaths.includes(pathname) || pathname.startsWith("/public")) {
    return NextResponse.next()
  }

  // Get the auth token from cookies
  const token = request.cookies.get("auth-token")?.value

  // If no token and not a public path, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify the token
  const user = await verifyToken(token)
  
  if (!user) {
    // If token is invalid, redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url))
    // Clear the invalid cookie
    response.cookies.delete("auth-token")
    return response
  }

  // Redirect super admin to super admin dashboard if they try to access regular dashboard
  if (user.role === "super_admin" && pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/superadmin/dashboard", request.url))
  }

  // Redirect regular users to regular dashboard if they try to access super admin area
  if (user.role !== "super_admin" && pathname.startsWith("/superadmin")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Allow the request to proceed
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    "/dashboard",
    "/superadmin/:path*",
    "/login",
    "/api/auth/login",
    "/api/auth/logout",
    "/public/:path*"
  ],
}