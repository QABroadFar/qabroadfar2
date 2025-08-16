import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getApiKeys, createApiKey } from "@/lib/database"

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const apiKeys = getApiKeys()
    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { service_name, permissions } = await request.json()
    if (!service_name || !permissions) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }
    const { key } = createApiKey(service_name, permissions)
    return NextResponse.json({ key })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
