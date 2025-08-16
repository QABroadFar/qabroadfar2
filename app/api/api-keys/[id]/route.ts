import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { deleteApiKey } from "@/lib/database"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const id = parseInt(params.id, 10)
    deleteApiKey(id)
    return NextResponse.json({ message: "API key deleted successfully" })
  } catch (error) {
    console.error("Error deleting API key:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
