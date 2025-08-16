import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getUsersByRole } from "@/lib/database"

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Any authenticated user can access this for now, for simplicity.
  // In a real-world scenario, you might want to restrict this.

  const { searchParams } = new URL(request.url)
  const role = searchParams.get("role")

  if (!role) {
    return NextResponse.json({ error: "Missing role parameter" }, { status: 400 })
  }

  try {
    const users = getUsersByRole(role)
    return NextResponse.json(users)
  } catch (error) {
    console.error(`Error fetching users by role ${role}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
