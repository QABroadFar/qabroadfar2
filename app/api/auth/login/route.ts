import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, logSystemEvent, getUserByUsername } from "@/lib/supabaseDatabase"
import { SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Check if user exists first
    const existingUser: any = await getUserByUsername(username)
    if (!existingUser) {
      await logSystemEvent("warn", "Failed login attempt - user not found", { username })
      return NextResponse.json({ error: "Username not found" }, { status: 401 })
    }

    // Check if user is active
    if (!existingUser.is_active) {
      await logSystemEvent("warn", "Failed login attempt - user inactive", { username })
      return NextResponse.json({ error: "Account is deactivated. Please contact administrator." }, { status: 401 })
    }

    const user = await authenticateUser(username, password)

    if (!user) {
      await logSystemEvent("warn", "Failed login attempt - invalid password", { username })
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Create JWT token
    const token = await new SignJWT({ userId: user.id, username: user.username, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret)

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    // Return a more detailed error for debugging
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
