import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  updateUserPassword,
  logSystemEvent
} from "@/lib/supabaseDatabase"
import { hashSync } from "bcryptjs"

// Update user password
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
    const { password } = await request.json()

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = hashSync(password, 10)
    const result = await updateUserPassword(userId, hashedPassword)
    
    if (result.changes > 0) {
      // Log the event
      await logSystemEvent("info", "User Password Updated", {
        user_id: userId,
        updated_by: auth.username
      })
      
      return NextResponse.json({ message: "User password updated successfully" })
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error updating user password:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}