import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getSystemLogs
} from "@/lib/database"

// Get system logs
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const systemLogs = getSystemLogs()
    return NextResponse.json(systemLogs)
  } catch (error) {
    console.error("Error fetching system logs:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}