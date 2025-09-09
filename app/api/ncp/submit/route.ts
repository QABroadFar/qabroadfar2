import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { createNCPReport, logSystemEvent } from "@/lib/supabaseDatabase"
import fs from "fs"
import path from "path"

// Submit new NCP report
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let data: any;
    let photoFilename: string | null = null;
    
    // Try to parse form data first
    try {
      const formData = await request.formData()
      
      // Convert formData to object
      data = {}
      for (const [key, value] of formData.entries()) {
        // Handle File objects specially
        if (value instanceof File) {
          // Save the file to public/uploads directory
          const buffer = Buffer.from(await value.arrayBuffer())
          const filename = `${Date.now()}-${value.name}`
          const filepath = path.join(process.cwd(), "public", "uploads", filename)
          
          // Ensure uploads directory exists
          const uploadsDir = path.join(process.cwd(), "public", "uploads")
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
          }
          
          // Save file
          fs.writeFileSync(filepath, buffer)
          photoFilename = filename
          data[key] = filename
        } else {
          data[key] = value
        }
      }
    } catch (formDataError) {
      // If formData parsing fails, try JSON
      try {
        data = await request.json()
      } catch (jsonError) {
        // If both fail, return error
        return NextResponse.json({ error: "Invalid request data format" }, { status: 400 })
      }
    }

    // Validate required fields
    if (!data.skuCode || !data.machineCode || !data.date || !data.timeIncident || 
        !data.holdQuantity || !data.holdQuantityUOM || !data.problemDescription || !data.qaLeader) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create NCP report
    const result = await createNCPReport(data, auth.username)
    
    if (result.id) {
      // Log the event
      await logSystemEvent("info", "NCP Report Submitted", {
        ncp_id: result.ncpId,
        submitted_by: auth.username,
        role: auth.role
      })
      
      return NextResponse.json({ 
        success: true,
        message: "NCP report submitted successfully",
        ncpId: result.ncpId
      })
    } else {
      return NextResponse.json({ error: "Failed to submit NCP report" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error submitting NCP report:", error)
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}