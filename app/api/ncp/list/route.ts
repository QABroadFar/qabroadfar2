import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getAllNCPReports } from "@/lib/supabaseDatabase"

// Get all NCP reports
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only super admin can view all NCP reports
  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const reports = await getAllNCPReports()
    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching NCP reports:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}