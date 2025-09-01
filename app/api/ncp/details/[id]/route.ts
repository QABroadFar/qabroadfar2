import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getNCPById, superEditNCP, deleteNCPReport, logSystemEvent } from "@/lib/database"

// Get NCP report by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only super admin can view any NCP report
  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid NCP ID" }, { status: 400 })
    }

    const report = getNCPById(id)
    if (!report) {
      return NextResponse.json({ error: "NCP report not found" }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error fetching NCP report:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Update NCP report
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

    const data = await request.json()
    
    // Update NCP report
    const result = superEditNCP(id, data, auth.username)
    
    if (result.changes > 0) {
      return NextResponse.json({ message: "NCP report updated successfully" })
    } else {
      return NextResponse.json({ error: "Failed to update NCP report" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating NCP report:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete NCP report
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get NCP details before deletion for logging
    const ncp = getNCPById(id)
    
    // Delete NCP report
    const result = deleteNCPReport(id)
    
    if (result.changes > 0) {
      // Log the event
      logSystemEvent("info", "NCP Report Deleted by Super Admin", {
        ncp_id: ncp?.ncp_id || id,
        deleted_by: auth.username
      })
      
      return NextResponse.json({ message: "NCP report deleted successfully" })
    } else {
      return NextResponse.json({ error: "Failed to delete NCP report" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting NCP report:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}