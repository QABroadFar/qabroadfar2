import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { exec } from "child_process"

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { path } = await request.json();
  if (!path) {
    return NextResponse.json({ error: "Missing backup file path" }, { status: 400 });
  }

  return new Promise((resolve) => {
    exec(`node scripts/restore-db.js "${path}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        resolve(NextResponse.json({ error: "Failed to restore backup" }, { status: 500 }));
        return;
      }
      resolve(NextResponse.json({ message: stdout }));
    });
  });
}
