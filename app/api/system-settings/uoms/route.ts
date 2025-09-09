import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getAllUOMs, 
  createUOM, 
  updateUOM, 
  deleteUOM,
  logSystemEvent
} from "@/lib/supabaseDatabase"

// Get all UOMs
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const uoms = await getAllUOMs()
    return NextResponse.json(uoms)
  } catch (error) {
    console.error("Error fetching UOMs:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Create new UOM
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { code, name } = await request.json()

    if (!code || !name) {
      return NextResponse.json({ error: "Code and name are required" }, { status: 400 })
    }

    const result = await createUOM(code, name)
    
    if (result.changes > 0) {
      // Log the event
      await logSystemEvent("info", "UOM Created", {
        code: code,
        name: name,
        created_by: auth.username
      })
      
      return NextResponse.json({ message: "UOM created successfully" })
    } else {
      return NextResponse.json({ error: "Failed to create UOM" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error creating UOM:", error)
    
    // Handle duplicate code error
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "UOM code already exists" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Update UOM
export async function PUT(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id, code, name } = await request.json()

    if (!id || !code || !name) {
      return NextResponse.json({ error: "ID, code, and name are required" }, { status: 400 })
    }

    const result = await updateUOM(id, code, name)
    
    if (result.changes > 0) {
      // Log the event
      await logSystemEvent("info", "UOM Updated", {
        id: id,
        code: code,
        name: name,
        updated_by: auth.username
      })
      
      return NextResponse.json({ message: "UOM updated successfully" })
    } else {
      return NextResponse.json({ error: "Failed to update UOM" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error updating UOM:", error)
    
    // Handle duplicate code error
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "UOM code already exists" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete UOM
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

    const result = await deleteUOM(id)
    
    if (result.changes > 0) {
      // Log the event
      await logSystemEvent("info", "UOM Deleted", {
        id: id,
        deleted_by: auth.username
      })
      
      return NextResponse.json({ message: "UOM deleted successfully" })
    } else {
      return NextResponse.json({ error: "Failed to delete UOM" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting UOM:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}