import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getNCPStatistics, 
  getAllUsers,
  getNCPsByMonth,
  getNCPStatusDistribution,
  getNCPsByTopSubmitters
} from "@/lib/database"

// Get dashboard data
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // Get all dashboard data
    const ncpStats = getNCPStatistics()
    const users = getAllUsers()
    const monthlyReports = getNCPsByMonth()
    const statusDistribution = getNCPStatusDistribution()
    const topSubmitters = getNCPsByTopSubmitters()
    
    const data = {
      stats: {
        totalUsers: users.length,
        totalNCPReports: ncpStats.total,
        pendingReports: ncpStats.pending,
        approvedReports: ncpStats.qaApproved + ncpStats.tlProcessed,
        rejectedReports: ncpStats.rejected
      },
      monthlyReports,
      statusDistribution,
      topSubmitters
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}