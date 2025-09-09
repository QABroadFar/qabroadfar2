import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getAllSKUCodes, 
  createSKUCode, 
  updateSKUCode, 
  deleteSKUCode,
  logSystemEvent
} from "@/lib/supabaseDatabase"

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
    const skuCodes = await getAllSKUCodes()
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
      return NextResponse.json({ error: "Code and description are required" }, { status: 400 })
    }

    const result = await createSKUCode(code, description)
    
    if (result.changes > 0) {
      // Log the event
      await logSystemEvent("info", "SKU Code Created", {
        code: code,
        description: description,
        created_by: auth.username
      })
      
      return NextResponse.json({ message: "SKU code created successfully" })
    } else {
      return NextResponse.json({ error: "Failed to create SKU code" }, { status: 500 })
    }
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
      return NextResponse.json({ error: "ID, code, and description are required" }, { status: 400 })
    }

    const result = await updateSKUCode(id, code, description)
    
    if (result.changes > 0) {
      // Log the event
      await logSystemEvent("info", "SKU Code Updated", {
        id: id,
        code: code,
        description: description,
        updated_by: auth.username
      })
      
      return NextResponse.json({ message: "SKU code updated successfully" })
    } else {
      return NextResponse.json({ error: "Failed to update SKU code" }, { status: 500 })
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
    const url = new URL(request.url)
    const id = parseInt(url.searchParams.get("id") || "0")
    
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const result = await deleteSKUCode(id)
    
    if (result.changes > 0) {
      // Log the event
      await logSystemEvent("info", "SKU Code Deleted", {
        id: id,
        deleted_by: auth.username
      })
      
      return NextResponse.json({ message: "SKU code deleted successfully" })
    } else {
      return NextResponse.json({ error: "Failed to delete SKU code" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting SKU code:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}