import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { createNCPReport } from "@/lib/database"

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const result = createNCPReport(data, auth.username)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating NCP report:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}