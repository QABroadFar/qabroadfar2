import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  deleteApiKey,
  logSystemEvent
} from "@/lib/database"

// Delete API key by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const id = parseInt(params.id, 10)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid API key ID" }, { status: 400 })
    }
    
    const result = deleteApiKey(id)
    
    if (result.changes > 0) {
      // Log the event
      logSystemEvent("info", "API Key Deleted", {
        api_key_id: id,
        deleted_by: auth.username
      })
      
      return NextResponse.json({ message: "API key deleted successfully" })
    } else {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error deleting API key:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}