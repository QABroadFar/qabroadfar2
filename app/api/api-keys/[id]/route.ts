import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { db } from "@/lib/database"

// Get a specific API key
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const apiKeyId = parseInt(params.id, 10)
    const apiKey = db.prepare("SELECT * FROM api_keys WHERE id = ?").get(apiKeyId)
    
    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    return NextResponse.json(apiKey)
  } catch (error) {
    console.error("Error fetching API key:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Update an API key
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const apiKeyId = parseInt(params.id, 10)
    const { serviceName, permissions, isActive } = await request.json()

    const stmt = db.prepare(`
      UPDATE api_keys 
      SET service_name = ?, permissions = ?, is_active = ?
      WHERE id = ?
    `)
    
    const result = stmt.run(serviceName, JSON.stringify(permissions), isActive ? 1 : 0, apiKeyId)

    if (result.changes === 0) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "API key updated successfully" })
  } catch (error) {
    console.error("Error updating API key:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}