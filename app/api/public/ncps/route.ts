import { NextRequest, NextResponse } from "next/server"
import { getAllNCPReports } from "@/lib/supabaseDatabase"

// Get all NCP reports for public access
export async function GET(request: NextRequest) {
  try {
    // No authentication required for public access
    const reports = await getAllNCPReports()
    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching NCP reports:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}