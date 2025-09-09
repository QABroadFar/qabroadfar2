import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getNCPStatistics, getAllUsers } from "@/lib/supabaseDatabase"

// Get dashboard statistics
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get NCP statistics
    const ncpStats = await getNCPStatistics()
    
    // Get user count (only for super_admin)
    let totalUsers = 0;
    if (auth.role === "super_admin") {
      const users = await getAllUsers()
      totalUsers = users.length
    }
    
    const stats = {
      total: (ncpStats as any).total,
      pending: (ncpStats as any).pending,
      approved: (ncpStats as any).qaApproved + (ncpStats as any).tlProcessed,
      processed: (ncpStats as any).tlProcessed,
      qaApproved: (ncpStats as any).qaApproved,
      tlProcessed: (ncpStats as any).tlProcessed,
      process_approved: (ncpStats as any).process_approved,
      manager_approved: (ncpStats as any).manager_approved,
      rejected: (ncpStats as any).rejected
    }

    // Return data in format expected by frontend
    return NextResponse.json({ 
      stats,
      charts: {
        monthly: [],
        statusDistribution: [],
        topSubmitters: []
      }
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}