import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { updateUserStatus } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const userId = parseInt(params.id, 10)
    const { is_active } = await request.json()

    if (typeof is_active !== 'boolean') {
      return NextResponse.json({ error: "Missing or invalid is_active status" }, { status: 400 })
    }

    updateUserStatus(userId, is_active)

    return NextResponse.json({ message: "User status updated successfully" })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
