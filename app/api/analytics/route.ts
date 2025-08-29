import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getNCPsByMonth,
  getAverageApprovalTime,
  getNCPStatusDistribution,
  getNCPsByTopSubmitters,
  getNCPStatistics
} from "@/lib/database"

// Get analytics data
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // Get all analytics data
    const monthlyData = getNCPsByMonth()
    const averageApprovalTime = getAverageApprovalTime()
    const statusDistribution = getNCPStatusDistribution()
    const topSubmitters = getNCPsByTopSubmitters()
    const ncpStats = getNCPStatistics()
    
    return NextResponse.json({
      monthlyData,
      averageApprovalTime,
      statusDistribution,
      topSubmitters,
      ncpStats
    })
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}