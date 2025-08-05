import { type NextRequest, NextResponse } from "next/server"
import { processNCPByTeamLeader } from "@/lib/database"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "team_leader") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { id, processData } = await request.json()

    if (!id || !processData) {
      return NextResponse.json({ error: "ID and process data are required" }, { status: 400 })
    }

    const result = processNCPByTeamLeader(id, processData, user.username)

    if (result.changes === 0) {
      return NextResponse.json({ error: "NCP report not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "NCP processed successfully and forwarded to Process Lead",
    })
  } catch (error) {
    console.error("Error in Team Leader processing:", error)
    return NextResponse.json({ error: "Failed to process NCP" }, { status: 500 })
  }
}
