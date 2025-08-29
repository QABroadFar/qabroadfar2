import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getSystemSetting,
  setSystemSetting,
  logSystemEvent
} from "@/lib/database"

// Get system setting by key
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")
    
    if (!key) {
      return NextResponse.json({ error: "Missing setting key" }, { status: 400 })
    }
    
    const value = getSystemSetting(key)
    
    return NextResponse.json({ 
      key,
      value
    })
  } catch (error) {
    console.error("Error fetching system setting:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Set system setting
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { key, value, description } = await request.json()
    
    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    setSystemSetting(key, value, description || "")
    
    // Log the event
    logSystemEvent("info", "System Setting Updated", {
      key,
      value,
      updated_by: auth.username
    })
    
    return NextResponse.json({ message: "System setting updated successfully" })
  } catch (error) {
    console.error("Error updating system setting:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}