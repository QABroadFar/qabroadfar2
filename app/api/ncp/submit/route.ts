import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { createNCPReport, logSystemEvent } from "@/lib/database"

// Submit new NCP report
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Parse form data
    const formData = await request.formData()
    
    // Convert formData to object
    const data: any = {}
    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    // Validate required fields
    if (!data.skuCode || !data.machineCode || !data.date || !data.timeIncident || 
        !data.holdQuantity || !data.holdQuantityUOM || !data.problemDescription || !data.qaLeader) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create NCP report
    const result = createNCPReport(data, auth.username)
    
    if (result.id) {
      // Log the event
      logSystemEvent("info", "NCP Report Submitted", {
        ncp_id: result.ncpId,
        submitted_by: auth.username,
        role: auth.role
      })
      
      return NextResponse.json({ 
        success: true,
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