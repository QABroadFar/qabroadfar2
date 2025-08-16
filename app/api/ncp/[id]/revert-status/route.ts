import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { revertNCPStatus } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const id = parseInt(params.id, 10)
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 })
    }

    revertNCPStatus(id, status, auth.username)

    return NextResponse.json({ message: "NCP status reverted successfully" })
  } catch (error) {
    console.error("Error reverting NCP status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
