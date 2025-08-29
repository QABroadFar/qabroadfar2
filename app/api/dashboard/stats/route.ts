import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getNCPStatistics, 
  getNCPStatisticsForRole, 
  getNCPsByMonth, 
  getNCPStatusDistribution,
  getNCPsByTopSubmitters,
  getAllUsers
} from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get statistics based on user role
    let stats
    if (user.role === "admin" || user.role === "super_admin") {
      // Admin/super admin gets overall statistics
      stats = getNCPStatistics()
    } else {
      // Other roles get role-specific statistics
      stats = getNCPStatisticsForRole(user.role, user.username)
    }

    // Get additional data for charts
    const monthlyData = getNCPsByMonth()
    const statusDistribution = getNCPStatusDistribution()
    const topSubmitters = getNCPsByTopSubmitters()
    
    // Get users for team leader assignments
    const users = getAllUsers()
    const teamLeaders = users.filter(u => u.role === "team_leader" && u.is_active)

    return NextResponse.json({
      success: true,
      data: {
        stats,
        charts: {
          monthly: monthlyData,
          statusDistribution,
          topSubmitters
        },
        teamLeaders
      }
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}