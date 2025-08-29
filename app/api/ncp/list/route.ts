import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getAllNCPReports } from "@/lib/database"
import { parse } from "csv-parse/sync"

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if this is a CSV export request
  const { searchParams } = new URL(request.url)
  const exportCSV = searchParams.get('export') === 'csv'
  
  if (exportCSV) {
    return exportNCPsToCSV(auth.role)
  }

  try {
    const reports = getAllNCPReports()
    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching NCP reports:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

async function exportNCPsToCSV(userRole: string) {
  try {
    const reports = getAllNCPReports()
    
    // Define CSV headers
    const headers = [
      "NCP ID",
      "SKU Code",
      "Machine Code",
      "Date",
      "Time of Incident",
      "Hold Quantity",
      "Hold Quantity UOM",
      "Problem Description",
      "QA Leader",
      "Status",
      "Submitted By",
      "Submitted At",
      "QA Approved By",
      "QA Approved At",
      "QA Rejection Reason",
      "Assigned Team Leader",
      "TL Processed By",
      "TL Processed At",
      "Root Cause Analysis",
      "Corrective Action",
      "Preventive Action",
      "Process Approved By",
      "Process Approved At",
      "Process Rejection Reason",
      "Process Comment",
      "Manager Approved By",
      "Manager Approved At",
      "Manager Rejection Reason",
      "Manager Comment",
      "Archived At"
    ]
    
    // Convert reports to CSV format
    const csvRows = [headers.join(",")]
    
    for (const report of reports) {
      const values = headers.map(header => {
        const key = header.toLowerCase()
          .replace(/ /g, "_")
          .replace(/-/g, "_")
        
        // Handle special cases for field mapping
        const fieldMap = {
          "ncp_id": "ncp_id",
          "sku_code": "sku_code",
          "machine_code": "machine_code",
          "date": "date",
          "time_of_incident": "time_incident",
          "hold_quantity": "hold_quantity",
          "hold_quantity_uom": "hold_quantity_uom",
          "problem_description": "problem_description",
          "qa_leader": "qa_leader",
          "status": "status",
          "submitted_by": "submitted_by",
          "submitted_at": "submitted_at",
          "qa_approved_by": "qa_approved_by",
          "qa_approved_at": "qa_approved_at",
          "qa_rejection_reason": "qa_rejection_reason",
          "assigned_team_leader": "assigned_team_leader",
          "tl_processed_by": "tl_processed_by",
          "tl_processed_at": "tl_processed_at",
          "root_cause_analysis": "root_cause_analysis",
          "corrective_action": "corrective_action",
          "preventive_action": "preventive_action",
          "process_approved_by": "process_approved_by",
          "process_approved_at": "process_approved_at",
          "process_rejection_reason": "process_rejection_reason",
          "process_comment": "process_comment",
          "manager_approved_by": "manager_approved_by",
          "manager_approved_at": "manager_approved_at",
          "manager_rejection_reason": "manager_rejection_reason",
          "manager_comment": "manager_comment",
          "archived_at": "archived_at"
        }
        
        const fieldName = fieldMap[key] || key
        const value = report[fieldName] || ""
        // Escape quotes and wrap in quotes if needed
        return `"${String(value).replace(/"/g, '""')}"`
      })
      
      csvRows.push(values.join(","))
    }
    
    const csvContent = csvRows.join("\n")
    
    // Create response with CSV content
    const response = new NextResponse(csvContent)
    response.headers.set("Content-Type", "text/csv")
    response.headers.set("Content-Disposition", `attachment; filename="ncp-reports-${new Date().toISOString().split('T')[0]}.csv"`)
    
    return response
  } catch (error) {
    console.error("Error exporting CSV:", error)
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 })
  }
}