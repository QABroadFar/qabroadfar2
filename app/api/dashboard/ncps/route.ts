import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getNCPReportsForUser, getPendingNCPsForRole } from "@/lib/database"

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if we're fetching pending NCPs for approval
  const { searchParams } = new URL(request.url)
  const pendingOnly = searchParams.get('pending') === 'true'
  
  try {
    let reports;
    if (pendingOnly) {
      reports = getPendingNCPsForRole(auth.role, auth.username)
    } else {
      reports = getNCPReportsForUser(auth.id, auth.role, auth.username)
    }
    
    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching NCP reports:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}