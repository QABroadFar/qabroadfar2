import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getAllSKUCodes, 
  createSKUCode, 
  updateSKUCode, 
  deleteSKUCode,
  getAllMachines,
  createMachine,
  updateMachine,
  deleteMachine,
  getAllUOMs,
  createUOM,
  updateUOM,
  deleteUOM,
  logSystemEvent
} from "@/lib/database"

// Get all system settings
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const url = new URL(request.url)
    const settingType = url.searchParams.get("type")
    
    let data
    switch (settingType) {
      case "sku-codes":
        data = getAllSKUCodes()
        break
      case "machines":
        data = getAllMachines()
        break
      case "uoms":
        data = getAllUOMs()
        break
      default:
        return NextResponse.json({ error: "Invalid setting type" }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching system settings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Create new system setting
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const url = new URL(request.url)
    const settingType = url.searchParams.get("type")
    const data = await request.json()
    
    let result
    switch (settingType) {
      case "sku-codes":
        result = createSKUCode(data.code, data.description)
        logSystemEvent("info", "SKU Code Created", {
          code: data.code,
          description: data.description,
          created_by: auth.username
        })
        break
      case "machines":
        result = createMachine(data.code, data.name)
        logSystemEvent("info", "Machine Created", {
          code: data.code,
          name: data.name,
          created_by: auth.username
        })
        break
      case "uoms":
        result = createUOM(data.code, data.name)
        logSystemEvent("info", "UOM Created", {
          code: data.code,
          name: data.name,
          created_by: auth.username
        })
        break
      default:
        return NextResponse.json({ error: "Invalid setting type" }, { status: 400 })
    }

    if (result.changes > 0) {
      return NextResponse.json({ message: "Setting created successfully" })
    } else {
      return NextResponse.json({ error: "Failed to create setting" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating system setting:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Update system setting
export async function PUT(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const url = new URL(request.url)
    const settingType = url.searchParams.get("type")
    const data = await request.json()
    
    let result
    switch (settingType) {
      case "sku-codes":
        result = updateSKUCode(data.id, data.code, data.description)
        logSystemEvent("info", "SKU Code Updated", {
          id: data.id,
          code: data.code,
          description: data.description,
          updated_by: auth.username
        })
        break
      case "machines":
        result = updateMachine(data.id, data.code, data.name)
        logSystemEvent("info", "Machine Updated", {
          id: data.id,
          code: data.code,
          name: data.name,
          updated_by: auth.username
        })
        break
      case "uoms":
        result = updateUOM(data.id, data.code, data.name)
        logSystemEvent("info", "UOM Updated", {
          id: data.id,
          code: data.code,
          name: data.name,
          updated_by: auth.username
        })
        break
      default:
        return NextResponse.json({ error: "Invalid setting type" }, { status: 400 })
    }

    if (result.changes > 0) {
      return NextResponse.json({ message: "Setting updated successfully" })
    } else {
      return NextResponse.json({ error: "Failed to update setting" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating system setting:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete system setting
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
    const settingType = url.searchParams.get("type")
    const id = parseInt(url.searchParams.get("id") || "0")
    
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }
    
    let result
    switch (settingType) {
      case "sku-codes":
        result = deleteSKUCode(id)
        logSystemEvent("info", "SKU Code Deleted", {
          id: id,
          deleted_by: auth.username
        })
        break
      case "machines":
        result = deleteMachine(id)
        logSystemEvent("info", "Machine Deleted", {
          id: id,
          deleted_by: auth.username
        })
        break
      case "uoms":
        result = deleteUOM(id)
        logSystemEvent("info", "UOM Deleted", {
          id: id,
          deleted_by: auth.username
        })
        break
      default:
        return NextResponse.json({ error: "Invalid setting type" }, { status: 400 })
    }

    if (result.changes > 0) {
      return NextResponse.json({ message: "Setting deleted successfully" })
    } else {
      return NextResponse.json({ error: "Failed to delete setting" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting system setting:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}