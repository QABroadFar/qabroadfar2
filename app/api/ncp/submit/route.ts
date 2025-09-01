import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { createNCPReport, logSystemEvent } from "@/lib/database"

// Submit new NCP report
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Super admin can submit NCP reports
  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const data = await request.json()

    // Validate required fields
    if (!data.skuCode || !data.machineCode || !data.date || !data.timeIncident || 
        !data.holdQuantity || !data.holdQuantityUOM || !data.problemDescription || !data.qaLeader) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create NCP report
    const result = createNCPReport(data, auth.username)
    
    if (result.id) {
      // Log the event
      logSystemEvent("info", "NCP Report Submitted by Super Admin", {
        ncp_id: result.ncpId,
        submitted_by: auth.username
      })
      
      return NextResponse.json({ 
        message: "NCP report submitted successfully",
        ncpId: result.ncpId
      })
    } else {
      return NextResponse.json({ error: "Failed to submit NCP report" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error submitting NCP report:", error)
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}