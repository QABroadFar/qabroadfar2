import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getNCPStatistics, getAllUsers } from "@/lib/database"

// Get dashboard statistics
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // Get NCP statistics
    const ncpStats = getNCPStatistics()
    
    // Get user count
    const users = getAllUsers()
    const totalUsers = users.length
    
    const stats = {
      totalUsers,
      totalNCPReports: ncpStats.total,
      pendingReports: ncpStats.pending,
      approvedReports: ncpStats.qaApproved + ncpStats.tlProcessed,
      rejectedReports: ncpStats.rejected
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}