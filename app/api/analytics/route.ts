import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import {
  getNCPsByMonth,
  getAverageApprovalTime,
  getNCPStatusDistribution,
  getNCPsByTopSubmitters,
} from "@/lib/database"
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const ncpByMonth = getNCPsByMonth()
    const avgApprovalTime = getAverageApprovalTime()
    const statusDistribution = getNCPStatusDistribution()
    const topSubmitters = getNCPsByTopSubmitters()

    return NextResponse.json({
      ncpByMonth,
      avgApprovalTime,
      statusDistribution,
      topSubmitters,
    })
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
