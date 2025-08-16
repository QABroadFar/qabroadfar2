import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { updateUserPassword } from "@/lib/database"

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
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Missing password" }, { status: 400 })
    }

    updateUserPassword(userId, password)

    return NextResponse.json({ message: "User password updated successfully" })
  } catch (error) {
    console.error("Error updating user password:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
