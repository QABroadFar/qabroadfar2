import { type NextRequest, NextResponse } from "next/server"
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/supabaseDatabase"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === "count") {
      const count = await getUnreadNotificationCount(user.id)
      return NextResponse.json({ success: true, count })
    }

    const notifications = await getNotificationsForUser(user.id)
    return NextResponse.json({ success: true, data: notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, notificationId } = await request.json()

    if (action === "mark_read") {
      if (notificationId) {
        await markNotificationAsRead(notificationId)
      } else {
        await markAllNotificationsAsRead(user.id)
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
