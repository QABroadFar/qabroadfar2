import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export async function verifyAuth(request: NextRequest) {
  try {
    // Get token from cookies using a more compatible approach
    const tokenCookie = request.cookies.get("auth-token")
    const token = tokenCookie?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, secret)

    return {
      id: payload.userId as number,
      username: payload.username as string,
      role: payload.role as string,
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return null
  }
}
