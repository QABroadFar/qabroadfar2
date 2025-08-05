import { type NextRequest, NextResponse } from "next/server"
import { approveNCPByQAManager, rejectNCPByQAManager } from "@/lib/database"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "qa_manager" && user.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { id, action, comment, rejectionReason } = await request.json()

    if (!id || !action) {
      return NextResponse.json({ error: "ID and action are required" }, { status: 400 })
    }

    let result
    if (action === "approve") {
      if (!comment || !comment.trim()) {
        return NextResponse.json({ error: "Final approval comment is required" }, { status: 400 })
      }
      result = approveNCPByQAManager(id, comment, user.username)
    } else if (action === "reject") {
      if (!rejectionReason || !rejectionReason.trim()) {
        return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
      }
      result = rejectNCPByQAManager(id, rejectionReason, user.username)
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (result.changes === 0) {
      return NextResponse.json({ error: "NCP report not found" }, { status: 404 })
    }

    const message =
      action === "approve"
        ? "NCP workflow completed successfully and archived"
        : "NCP rejected and returned to Team Leader"

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error("Error in QA Manager approval:", error)
    return NextResponse.json({ error: "Failed to process final approval" }, { status: 500 })
  }
}
