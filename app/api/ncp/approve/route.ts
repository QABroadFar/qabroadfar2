import { type NextRequest, NextResponse } from "next/server"
import { approveNCPByQALeader, rejectNCPByQALeader } from "@/lib/database"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has approval permissions
    if (user.role !== "admin" && user.role !== "qa_leader" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { id, action, rejectionReason, ...approvalData } = await request.json()

    if (!id || !action) {
      return NextResponse.json({ error: "ID and action are required" }, { status: 400 })
    }

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    let result;
    if (action === "approved") {
      result = approveNCPByQALeader(id, approvalData, user.username)
    } else if (action === "rejected") {
      if (!rejectionReason) {
        return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
      }
      result = rejectNCPByQALeader(id, rejectionReason, user.username)
    }

    if (result.changes === 0) {
      return NextResponse.json({ error: "NCP report not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `NCP report ${action} successfully`,
    })
  } catch (error) {
    console.error("Error updating NCP status:", error)
    return NextResponse.json({ error: "Failed to update NCP status" }, { status: 500 })
  }
}
