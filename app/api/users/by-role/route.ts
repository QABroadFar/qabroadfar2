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

  // Allow users with specific roles to access this based on the role being requested
  const allowedRoles = ["super_admin", "admin", "user", "qa_leader", "team_leader", "process_lead", "qa_manager"]
  if (!allowedRoles.includes(auth.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    
    if (!role) {
      return NextResponse.json({ error: "Role parameter is required" }, { status: 400 })
    }
    
    // For security, only allow fetching specific roles
    const fetchableRoles = ["qa_leader", "team_leader"]
    if (!fetchableRoles.includes(role)) {
      return NextResponse.json({ error: "Cannot fetch users for this role" }, { status: 403 })
    }
    
    const users = getUsersByRole(role)
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users by role:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}