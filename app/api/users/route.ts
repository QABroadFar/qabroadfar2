import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getAllUsers, createUser, logSystemEvent } from "@/lib/database"

// Get all users
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const users = getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

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

    // Create user in database
    const result = createUser(username, password, role, fullName)
    
    if (result.changes > 0) {
      // Log the event
      logSystemEvent("info", "User Created", {
        created_by: auth.username,
        new_user: username,
        role: role
      })
      
      return NextResponse.json({ message: "User created successfully" })
    } else {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error creating user:", error)
    
    // Handle duplicate username error
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}