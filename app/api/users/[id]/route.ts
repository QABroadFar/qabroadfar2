import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { hashSync } from "bcryptjs"
import { db } from "@/lib/database"

// Create a new user
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { username, password, role, fullName } = await request.json()

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = db.prepare("SELECT id FROM users WHERE username = ?").get(username)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = hashSync(password, 10)

    // Create user
    const stmt = db.prepare(`
      INSERT INTO users (username, password, role, full_name, is_active)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(username, hashedPassword, role, fullName || null, true)

    return NextResponse.json({ 
      message: "User created successfully",
      userId: result.lastInsertRowid
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete a user
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
    
    // Prevent deleting the current user
    if (userId === auth.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
    }

    // Delete user
    const stmt = db.prepare("DELETE FROM users WHERE id = ?")
    const result = stmt.run(userId)

    if (result.changes === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}