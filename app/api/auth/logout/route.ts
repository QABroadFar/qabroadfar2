import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" })

  // Clear the auth cookie with multiple methods to ensure it's removed
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })

  // Also try to delete the cookie completely
  response.cookies.delete("auth-token")

  return response
}
