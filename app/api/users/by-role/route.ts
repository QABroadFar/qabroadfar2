import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { 
  getUsersByRole
} from "@/lib/database"

// Get users by role
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only super admin and admin can access this
  if (auth.role !== "super_admin" && auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    
    if (!role) {
      return NextResponse.json({ error: "Role parameter is required" }, { status: 400 })
    }
    
    const users = getUsersByRole(role)
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users by role:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}