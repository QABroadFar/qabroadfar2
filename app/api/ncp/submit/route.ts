import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { createNCPReport } from "@/lib/database"

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Handle multipart form data
    const formData = await request.formData()
    
    // Extract data from form
    const data = {
      skuCode: formData.get("skuCode") as string || "",
      machineCode: formData.get("machineCode") as string || "",
      date: formData.get("date") as string || "",
      timeIncident: formData.get("timeIncident") as string || "",
      holdQuantity: parseInt(formData.get("holdQuantity") as string) || 0,
      holdQuantityUOM: formData.get("holdQuantityUOM") as string || "",
      problemDescription: formData.get("problemDescription") as string || "",
      photoAttachment: formData.get("photoAttachment") as string | null,
      qaLeader: formData.get("qaLeader") as string || "",
    }
    
    // Validate required fields
    if (!data.skuCode || !data.machineCode || !data.date || !data.timeIncident || 
        !data.holdQuantity || !data.holdQuantityUOM || !data.problemDescription || !data.qaLeader) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    const result = createNCPReport(data, auth.username)
    return NextResponse.json({ success: true, ncpId: result.ncpId })
  } catch (error: any) {
    console.error("Error creating NCP report:", error)
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
  }
}