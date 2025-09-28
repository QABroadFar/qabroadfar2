import { type NextRequest, NextResponse } from "next/server"
import { approveNCPByQALeader, rejectNCPByQALeader } from "@/lib/database"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "qa_leader") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { id, action, approvalData, rejectionReason } = await request.json()

    if (!id || !action) {
      return NextResponse.json({ error: "ID and action are required" }, { status: 400 })
    }

    let result
    if (action === "approve") {
      if (!approvalData) {
        return NextResponse.json({ error: "Approval data is required" }, { status: 400 })
      }
      result = approveNCPByQALeader(id, approvalData, user.username)
    } else if (action === "reject") {
      if (!rejectionReason) {
        return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
      }
      result = rejectNCPByQALeader(id, rejectionReason, user.username)
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (result.changes === 0) {
      return NextResponse.json({ error: "NCP report not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `NCP report ${action}d successfully`,
    })
  } catch (error) {
    console.error("Error in QA approval:", error)
    return NextResponse.json({ error: "Failed to process QA approval" }, { status: 500 })
  }
}
