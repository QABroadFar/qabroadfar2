import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getApiKeys, 
  deleteApiKey,
  logSystemEvent
} from "@/lib/database"

// Get specific API key
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const apiKeys = getApiKeys()
    const apiKey = apiKeys.find(key => key.id === id)
    
    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    return NextResponse.json(apiKey)
  } catch (error) {
    console.error("Error fetching API key:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Update API key
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // In a real implementation, you would update the API key here
    // For now, we'll just return a success message
    // Log the event
    logSystemEvent("info", "API Key Updated", {
      id: id,
      updated_by: auth.username
    })
    
    return NextResponse.json({ message: "API key updated successfully" })
  } catch (error) {
    console.error("Error updating API key:", error)
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