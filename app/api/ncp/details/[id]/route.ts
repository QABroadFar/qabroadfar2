import { type NextRequest, NextResponse } from "next/server"
import { getNCPById } from "@/lib/database"
import { verifyAuth } from "@/lib/auth"

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
