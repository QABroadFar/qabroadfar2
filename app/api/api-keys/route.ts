import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/database"

// Get all API keys
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const apiKeys = db.prepare("SELECT * FROM api_keys").all()
    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Create a new API key
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { serviceName, permissions } = await request.json()

    if (!serviceName || !permissions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a new API key
    const key = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

    const stmt = db.prepare(`
      INSERT INTO api_keys (key, service_name, permissions, is_active)
      VALUES (?, ?, ?, ?)
    `)
    
    const result = stmt.run(key, serviceName, JSON.stringify(permissions), true)

    return NextResponse.json({ 
      message: "API key created successfully",
      apiKey: key,
      id: result.lastInsertRowid
    })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete an API key
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const apiKeyId = parseInt(params.id, 10)
    
    const stmt = db.prepare("DELETE FROM api_keys WHERE id = ?")
    const result = stmt.run(apiKeyId)

    if (result.changes === 0) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "API key deleted successfully" })
  } catch (error) {
    console.error("Error deleting API key:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}