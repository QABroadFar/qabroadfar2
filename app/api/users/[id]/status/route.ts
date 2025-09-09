import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  updateUserStatus,
  logSystemEvent
} from "@/lib/supabaseDatabase"

// Update user status (active/inactive)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const userId = parseInt(params.id, 10)
    const { is_active } = await request.json()

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (is_active === undefined) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const result = await updateUserStatus(userId, is_active)
    
    if (result.changes > 0) {
      // Log the event
      await logSystemEvent("info", "User Status Updated", {
        user_id: userId,
        is_active,
        updated_by: auth.username
      })
      
      return NextResponse.json({ message: "User status updated successfully" })
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}