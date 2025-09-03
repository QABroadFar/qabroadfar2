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
    console.log("Fetching NCP reports for user:", { 
      id: auth.id, 
      role: auth.role, 
      username: auth.username,
      pendingOnly: pendingOnly
    });
    
    let reports;
    if (pendingOnly) {
      reports = getPendingNCPsForRole(auth.role, auth.username)
    } else {
      reports = getNCPReportsForUser(auth.id, auth.role, auth.username)
    }
    
    console.log("Reports fetched successfully, count:", reports.length);
    console.log("Sample report submitted_at:", reports[0]?.submitted_at);
    
    // Return data in format expected by frontend
    return NextResponse.json({ data: reports })
  } catch (error) {
    console.error("Error fetching NCP reports:", error)
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}