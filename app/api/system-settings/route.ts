import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getAuditLog, 
  getSystemLogs, 
  getApiKeys, 
  createApiKey, 
  deleteApiKey,
  logSystemEvent
} from "@/lib/supabaseDatabase"

// Get audit logs
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "audit"

  try {
    switch (type) {
      case "audit":
        const auditLogs = await getAuditLog()
        return NextResponse.json(auditLogs)
      case "system":
        const systemLogs = await getSystemLogs()
        return NextResponse.json(systemLogs)
      case "api-keys":
        const apiKeys = await getApiKeys()
        return NextResponse.json(apiKeys)
      default:
        return NextResponse.json({ error: "Invalid log type" }, { status: 400 })
    }
  } catch (error) {
    console.error(`Error fetching ${type} logs:`, error)
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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    const result = await createApiKey(serviceName, permissions)
    
    // Log the event
    await logSystemEvent("info", "API Key Created", {
      service_name: serviceName,
      permissions,
      created_by: auth.username
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}