import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  revertNCPStatus, 
  getNCPById,
  logSystemEvent
} from "@/lib/database"

// Revert NCP status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid NCP ID" }, { status: 400 })
    }
    
    const { newStatus } = await request.json()
    
    if (!newStatus) {
      return NextResponse.json({ error: "New status is required" }, { status: 400 })
    }
    
    // Revert NCP status
    const result = revertNCPStatus(id, newStatus, auth.username)
    
    if (result.changes > 0) {
      // Get NCP details for logging
      const ncp: any = getNCPById(id)
      
      logSystemEvent("info", "NCP Status Reverted by Super Admin", {
        ncp_id: ncp?.ncp_id || id,
        new_status: newStatus,
        reverted_by: auth.username
      })
      
      return NextResponse.json({ message: "NCP status reverted successfully" })
    } else {
      return NextResponse.json({ error: "Failed to revert NCP status" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error reverting NCP status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}