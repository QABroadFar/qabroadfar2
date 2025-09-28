import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  updateUserUsername,
  getUserByUsername,
  logSystemEvent
} from "@/lib/supabaseDatabase"

// Update user username
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
    const { username } = await request.json()

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Validate username format (alphanumeric, underscore, hyphen, dots, 3-30 chars)
    const usernameRegex = /^[a-zA-Z0-9_.-]{3,30}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        error: "Username must be 3-30 characters and contain only letters, numbers, underscore, hyphen, or dot" 
      }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await getUserByUsername(username)
    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    const result = await updateUserUsername(userId, username)
    
    if (result && result.changes > 0) {
      // Log the event
      await logSystemEvent("info", "User Username Updated", {
        user_id: userId,
        new_username: username,
        updated_by: auth.username
      })
      
      return NextResponse.json({ message: "User username updated successfully" })
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error updating user username:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}