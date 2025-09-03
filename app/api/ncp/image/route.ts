import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import fs from "fs"
import path from "path"

// Get NCP image by filename
export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get filename from query parameters
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")
    
    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    // Define image path (in a real app, you might want to store images in a dedicated directory)
    const imagePath = path.join(process.cwd(), "public", "uploads", filename)
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath)
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase()
    let contentType = "image/jpeg"
    if (ext === ".png") contentType = "image/png"
    if (ext === ".gif") contentType = "image/gif"
    if (ext === ".webp") contentType = "image/webp"
    
    // Return the image with proper content type
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    })
  } catch (error: any) {
    console.error("Error serving image:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}