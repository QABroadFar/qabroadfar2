import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getNCPsByMonth, getNCPStatusDistribution, getNCPsByTopSubmitters } from "@/lib/supabaseDatabase"

// Get analytics data
export async function GET(request: NextRequest, { params }: { params: { type: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const type = params.type

    let data
    switch (type) {
      case "monthly-reports":
        data = await getNCPsByMonth()
        break
      case "status-distribution":
        data = await getNCPStatusDistribution()
        break
      case "top-submitters":
        data = await getNCPsByTopSubmitters()
        break
      default:
        return NextResponse.json({ error: "Invalid analytics type" }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}