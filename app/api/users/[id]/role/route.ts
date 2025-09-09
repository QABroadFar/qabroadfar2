import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  updateUserRole,
  logSystemEvent
} from "@/lib/supabaseDatabase"

// Update user role
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
    const { role } = await request.json()

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 })
    }

    const result = await updateUserRole(userId, role)
    
    if (result.changes > 0) {
      // Log the event
      await logSystemEvent("info", "User Role Updated", {
        user_id: userId,
        new_role: role,
        updated_by: auth.username
      })
      
      return NextResponse.json({ message: "User role updated successfully" })
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}