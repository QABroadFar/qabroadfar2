import { type NextRequest, NextResponse } from "next/server"
import { getNCPById, superEditNCP, logSystemEvent } from "@/lib/database"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid NCP ID" }, { status: 400 })
    }

    const data = await request.json()
    superEditNCP(id, data, auth.username)

    return NextResponse.json({ message: "NCP report updated successfully" })
  } catch (error) {
    console.error("Error updating NCP report:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid NCP ID" }, { status: 400 })
    }

    const ncp = getNCPById(id)
    if (!ncp) {
      return NextResponse.json({ error: "NCP not found" }, { status: 404 })
    }

    // Check permissions based on role
    const hasPermission =
      user.role === "admin" ||
      user.role === "qa_manager" ||
      user.role === "qa_leader" ||
      (user.role === "team_leader" && ncp.assigned_team_leader === user.username) ||
      user.role === "process_lead" ||
      (user.role === "user" && ncp.submitted_by === user.username)

    if (!hasPermission) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: ncp,
    })
  } catch (error) {
    console.error("Error fetching NCP details:", error)
    return NextResponse.json({ error: "Failed to fetch NCP details" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid NCP ID" }, { status: 400 })
    }

    // Get NCP details before deletion for logging
    const ncp = getNCPById(id)
    if (!ncp) {
      return NextResponse.json({ error: "NCP not found" }, { status: 404 })
    }

    // Delete the NCP report
    const stmt = db.prepare("DELETE FROM ncp_reports WHERE id = ?")
    const result = stmt.run(id)

    if (result.changes > 0) {
      // Log the deletion
      logSystemEvent("info", "NCP Report Deleted", {
        ncp_id: ncp.ncp_id,
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
