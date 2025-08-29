import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getAllSKUCodes,
  createSKUCode,
  updateSKUCode,
  deleteSKUCode,
  logSystemEvent
} from "@/lib/database"

// Get all SKU codes
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const skuCodes = getAllSKUCodes()
    return NextResponse.json(skuCodes)
  } catch (error) {
    console.error("Error fetching SKU codes:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Create new SKU code
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { code, description } = await request.json()
    
    if (!code || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    const result = createSKUCode(code, description)
    
    // Log the event
    logSystemEvent("info", "SKU Code Created", {
      code,
      description,
      created_by: auth.username
    })
    
    return NextResponse.json({ 
      message: "SKU code created successfully",
      id: result.lastInsertRowid
    })
  } catch (error: any) {
    console.error("Error creating SKU code:", error)
    
    // Handle duplicate code error
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "SKU code already exists" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Update SKU code
export async function PUT(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id, code, description } = await request.json()
    
    if (!id || !code || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    const result = updateSKUCode(id, code, description)
    
    if (result.changes > 0) {
      // Log the event
      logSystemEvent("info", "SKU Code Updated", {
        id,
        code,
        description,
        updated_by: auth.username
      })
      
      return NextResponse.json({ message: "SKU code updated successfully" })
    } else {
      return NextResponse.json({ error: "SKU code not found" }, { status: 404 })
    }
  } catch (error: any) {
    console.error("Error updating SKU code:", error)
    
    // Handle duplicate code error
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "SKU code already exists" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete SKU code
export async function DELETE(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get("id") || "", 10)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid SKU code ID" }, { status: 400 })
    }
    
    const result = deleteSKUCode(id)
    
    if (result.changes > 0) {
      // Log the event
      logSystemEvent("info", "SKU Code Deleted", {
        id,
        deleted_by: auth.username
      })
      
      return NextResponse.json({ message: "SKU code deleted successfully" })
    } else {
      return NextResponse.json({ error: "SKU code not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error deleting SKU code:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}