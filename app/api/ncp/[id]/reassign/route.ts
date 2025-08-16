import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { reassignNCP } from "@/lib/database"

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
    const { assignee, role } = await request.json()

    if (!assignee || !role) {
      return NextResponse.json({ error: "Missing assignee or role" }, { status: 400 })
    }

    if (role !== 'qa_leader' && role !== 'team_leader') {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    reassignNCP(id, assignee, role, auth.username)

    return NextResponse.json({ message: "NCP reassigned successfully" })
  } catch (error) {
    console.error("Error reassigning NCP:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
