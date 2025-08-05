import { type NextRequest, NextResponse } from "next/server"
import { getNCPReportsForUser, getPendingNCPsForRole } from "@/lib/database"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all"

    let reports
    if (type === "pending") {
      reports = getPendingNCPsForRole(user.role, user.username)
    } else {
      reports = getNCPReportsForUser(user.id, user.role, user.username)
    }

    return NextResponse.json({
      success: true,
      data: reports,
    })
  } catch (error) {
    console.error("Error fetching NCP reports:", error)
    return NextResponse.json({ error: "Failed to fetch NCP reports" }, { status: 500 })
  }
}
