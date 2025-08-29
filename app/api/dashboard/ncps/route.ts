import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getNCPReportsForUser, 
  getPendingNCPsForRole 
} from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "assigned"

    let ncps
    if (type === "pending") {
      // Get pending NCPs for approval based on role
      ncps = getPendingNCPsForRole(user.role, user.username)
    } else {
      // Get all NCPs assigned to or created by user
      ncps = getNCPReportsForUser(user.id, user.role, user.username)
    }

    return NextResponse.json({
      success: true,
      data: ncps
    })
  } catch (error) {
    console.error("Dashboard NCPs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}