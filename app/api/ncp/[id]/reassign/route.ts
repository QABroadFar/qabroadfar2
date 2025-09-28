import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  reassignNCP,
  getNCPById,
  logSystemEvent
} from "@/lib/supabaseDatabase"

// Reassign NCP report
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
    
    const { newAssignee, role } = await request.json()
    
    if (!newAssignee || !role) {
      return NextResponse.json({ error: "New assignee and role are required" }, { status: 400 })
    }
    
    // Reassign NCP report
    const result = await reassignNCP(id, newAssignee, role, auth.username)
    
    if (result && result.changes > 0) {
      // Get NCP details for logging
      const ncp: any = await getNCPById(id)
      
      await logSystemEvent("info", "NCP Report Reassigned by Super Admin", {
        ncp_id: ncp?.ncp_id || id,
        new_assignee: newAssignee,
        role: role,
        reassigned_by: auth.username
      })
      
      return NextResponse.json({ message: "NCP report reassigned successfully" })
    } else {
      return NextResponse.json({ error: "Failed to reassign NCP report" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error reassigning NCP report:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}