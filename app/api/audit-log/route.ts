import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getAuditLog } from "@/lib/supabaseDatabase"

// Get audit logs
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const logs = await getAuditLog()
    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}