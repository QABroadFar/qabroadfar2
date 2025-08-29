import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  deleteUser,
  logSystemEvent
} from "@/lib/database"

// Delete user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const userId = parseInt(params.id, 10)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Prevent super admin from deleting themselves
    if (userId === auth.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
    }

    const result = deleteUser(userId)
    
    if (result.changes > 0) {
      // Log the event
      logSystemEvent("info", "User Deleted", {
        user_id: userId,
        deleted_by: auth.username
      })
      
      return NextResponse.json({ message: "User deleted successfully" })
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}