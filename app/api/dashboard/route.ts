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

  try {
    // Get all dashboard data
    const ncpStats = getNCPStatistics()
    
    // Get user count (only for super_admin)
    let totalUsers = 0;
    if (auth.role === "super_admin") {
      const users = getAllUsers()
      totalUsers = users.length
    }
    
    const monthlyReports = getNCPsByMonth()
    const statusDistribution = getNCPStatusDistribution()
    const topSubmitters = getNCPsByTopSubmitters()
    
    const data = {
      stats: {
        totalUsers: totalUsers,
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