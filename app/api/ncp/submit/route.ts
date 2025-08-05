import { type NextRequest, NextResponse } from "next/server"
import { createNCPReport } from "@/lib/database"
import { verifyAuth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()

    // FIXED: Handle file upload properly
    const photoFile = formData.get("photoAttachment") as File
    let photoPath = null

    if (photoFile && photoFile.size > 0) {
      // FIXED: Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), "public", "uploads")
      try {
        await mkdir(uploadsDir, { recursive: true })
        console.log("✅ Uploads directory created/verified")
      } catch (error) {
        console.log("⚠️ Directory might already exist")
      }

      // FIXED: Generate unique filename with timestamp
      const timestamp = Date.now()
      const fileExtension = path.extname(photoFile.name)
      const cleanFileName = photoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const fileName = `${timestamp}-${cleanFileName}`
      photoPath = `/uploads/${fileName}` // FIXED: Add leading slash for web path

      // FIXED: Save file to public/uploads
      const buffer = await photoFile.arrayBuffer()
      const fullPath = path.join(process.cwd(), "public", "uploads", fileName)
      await writeFile(fullPath, Buffer.from(buffer))

      console.log(`✅ File saved: ${fullPath}`)
      console.log(`✅ Web path: ${photoPath}`)
    }

    const ncpData = {
      skuCode: formData.get("skuCode"),
      machineCode: formData.get("machineCode"),
      date: formData.get("date"),
      timeIncident: formData.get("timeIncident"),
      holdQuantity: Number.parseInt(formData.get("holdQuantity") as string),
      holdQuantityUOM: formData.get("holdQuantityUOM"),
      problemDescription: formData.get("problemDescription"),
      photoAttachment: photoPath, // FIXED: Store correct path
      qaLeader: formData.get("qaLeader"),
      submittedBy: user.username,
    }

    console.log("📝 NCP Data:", ncpData)

    const result = createNCPReport(ncpData)

    return NextResponse.json({
      success: true,
      message: "NCP report submitted successfully",
      ncpId: result.ncpId,
      id: result.id,
      photoPath: photoPath, // Return photo path for verification
    })
  } catch (error) {
    console.error("❌ Submit error:", error)
    return NextResponse.json(
      {
        error: "Failed to submit NCP report",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
