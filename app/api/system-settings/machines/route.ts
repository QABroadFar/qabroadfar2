import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getAllMachines,
  createMachine,
  updateMachine,
  deleteMachine,
  logSystemEvent
} from "@/lib/database"

// Get all machines
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const machines = getAllMachines()
    return NextResponse.json(machines)
  } catch (error) {
    console.error("Error fetching machines:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Create new machine
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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    const result = createMachine(code, name)
    
    // Log the event
    logSystemEvent("info", "Machine Created", {
      code,
      name,
      created_by: auth.username
    })
    
    return NextResponse.json({ 
      message: "Machine created successfully",
      id: result.lastInsertRowid
    })
  } catch (error: any) {
    console.error("Error creating machine:", error)
    
    // Handle duplicate code error
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Machine code already exists" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Update machine
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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    const result = updateMachine(id, code, name)
    
    if (result.changes > 0) {
      // Log the event
      logSystemEvent("info", "Machine Updated", {
        id,
        code,
        name,
        updated_by: auth.username
      })
      
      return NextResponse.json({ message: "Machine updated successfully" })
    } else {
      return NextResponse.json({ error: "Machine not found" }, { status: 404 })
    }
  } catch (error: any) {
    console.error("Error updating machine:", error)
    
    // Handle duplicate code error
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Machine code already exists" }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete machine
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
      return NextResponse.json({ error: "Invalid machine ID" }, { status: 400 })
    }
    
    const result = deleteMachine(id)
    
    if (result.changes > 0) {
      // Log the event
      logSystemEvent("info", "Machine Deleted", {
        id,
        deleted_by: auth.username
      })
      
      return NextResponse.json({ message: "Machine deleted successfully" })
    } else {
      return NextResponse.json({ error: "Machine not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error deleting machine:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}