import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { exec } from "child_process"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const backupDir = path.join(process.cwd(), "backups")
  if (!fs.existsSync(backupDir)) {
    return NextResponse.json([])
  }

  const backupFiles = fs
    .readdirSync(backupDir)
    .filter((file) => file.endsWith(".db"))
    .map((file) => ({
      name: file,
      path: path.join(backupDir, file),
    }))

  return NextResponse.json(backupFiles)
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth || auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return new Promise((resolve) => {
    exec("node scripts/backup-db.js", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        resolve(NextResponse.json({ error: "Failed to create backup" }, { status: 500 }));
        return;
      }
      resolve(NextResponse.json({ message: stdout }));
    });
  });
}
