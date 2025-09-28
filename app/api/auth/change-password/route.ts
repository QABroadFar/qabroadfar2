import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { authenticateUser, updateUserPassword } from "@/lib/supabaseDatabase";
import { hashSync } from "bcryptjs";

// Change user's own password
export async function PUT(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 });
    }

    // Validate new password strength (at least 8 characters)
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
    }

    // Verify current password is correct
    const user = await authenticateUser(auth.username, currentPassword);
    if (!user) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Update password in database (the function will hash it)
    const result = await updateUserPassword(auth.id, newPassword);
    
    if (result && result.changes > 0) {
      return NextResponse.json({ message: "Password updated successfully" });
    } else {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}