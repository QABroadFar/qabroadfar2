import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getApiKeys, 
  createApiKey, 
  deleteApiKey,
  logSystemEvent
} from "@/lib/database"

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
    const apiKeys = getApiKeys()
    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Create new API key
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
      return NextResponse.json({ error: "Service name and permissions are required" }, { status: 400 })
    }

    const result = createApiKey(serviceName, permissions)
    
    // Log the event
    logSystemEvent("info", "API Key Created", {
      service_name: serviceName,
      permissions: permissions,
      created_by: auth.username
    })
    
    return NextResponse.json({ 
      message: "API key created successfully",
      apiKey: result.key
    })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete API key
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const id = parseInt(params.id)
    
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    deleteApiKey(id)
    
    // Log the event
    logSystemEvent("info", "API Key Deleted", {
      id: id,
      deleted_by: auth.username
    })
    
    return NextResponse.json({ message: "API key deleted successfully" })
  } catch (error) {
    console.error("Error deleting API key:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}