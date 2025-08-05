import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getUserByUsername } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get full user details
    const userDetails = getUserByUsername(user.username)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: userDetails?.full_name || user.username,
      },
    })
  } catch (error) {
    console.error("Error getting user info:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
