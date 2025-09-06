"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { formatToWIB } from "@/lib/date-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Package,
  FileText,
  Clock,
  Target,
  Wrench,
  Shield,
  ThumbsUp,
  ThumbsDown,
  ImageIcon,
  Award,
} from "lucide-react"
import * as XLSX from 'xlsx'; // Import XLSX for Excel export

interface QAManagerApprovalProps {
  onBack: () => void
}

export function QAManagerApproval({ onBack }: QAManagerApprovalProps) {
  const [pendingNCPs, setPendingNCPs] = useState<any[]>([])
  const [selectedNCP, setSelectedNCP] = useState<any>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false) // State for the success dialog
  const [successMessage, setSuccessMessage] = useState("") // State for the success message
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [finalComment, setFinalComment] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchPendingNCPs()
  }, [])

  const fetchPendingNCPs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/dashboard/ncps?pending=true")
      if (response.ok) {
        const data = await response.json()
        // Handle both API response formats
        const ncpData = data.data || data
        // Filter for NCPs that have been approved by Process Lead
        const managerReady = Array.isArray(ncpData) ? ncpData.filter((ncp: any) => ncp.status === "process_approved") : []
        setPendingNCPs(managerReady)
      } else {
        console.error("Failed to fetch pending NCPs")
      }
    } catch (error) {
      console.error("Error fetching pending NCPs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = (ncp: any) => {
    setSelectedNCP(ncp)
    setFinalComment("")
    setShowApprovalDialog(true)
  }

  const handleReject = (ncp: any) => {
    setSelectedNCP(ncp)
    setRejectionReason("")
    setShowRejectionDialog(true)
  }

  const submitFinalApproval = async () => {
    if (!selectedNCP || !finalComment.trim()) {
      alert("Please provide a final approval comment")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/ncp/approve-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedNCP.id,
          action: "approve",
          comment: finalComment,
        }),
      })

      if (response.ok) {
        setShowApprovalDialog(false)
        setSuccessMessage(`NCP ${selectedNCP.ncp_id} approved and archived successfully! Workflow completed.`)
        setShowSuccessDialog(true)
        fetchPendingNCPs()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error approving NCP:", error)
      alert("Failed to approve NCP")
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitRejection = async () => {
    if (!selectedNCP || !rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/ncp/approve-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedNCP.id,
          action: "reject",
          rejectionReason,
        }),
      })

      if (response.ok) {
        setShowRejectionDialog(false)
        // Show success message for rejection as well
        setSuccessMessage(`NCP ${selectedNCP.ncp_id} rejected and returned to Team Leader.`)
        setShowSuccessDialog(true)
        fetchPendingNCPs()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error rejecting NCP:", error)
      alert("Failed to reject NCP")
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportToExcel = () => {
    if (pendingNCPs.length === 0) {
      alert("No data to export.");
      return;
    }

    // Prepare data for Excel
    const worksheetData = pendingNCPs.map((ncp: any) => ({
      "NCP ID": ncp.ncp_id,
      "SKU Code": ncp.sku_code,
      "Machine Code": ncp.machine_code,
      "Incident Date": new Date(ncp.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      "Incident Time": ncp.time_incident,
      "Process Lead": ncp.process_approved_by,
      "Status": "Ready for Final Approval", // Assuming status for this view
      "Problem Description": ncp.problem_description,
      "QA Leader Disposition": ncp.disposisi,
      "Sortir": ncp.jumlah_sortir || "0",
      "Release": ncp.jumlah_release || "0",
      "Reject": ncp.jumlah_reject || "0",
      "Total Hold Quantity": `${ncp.hold_quantity} ${ncp.hold_quantity_uom}`,
      "Root Cause Analysis": ncp.root_cause_analysis,
      "Corrective Action": ncp.corrective_action,
      "Preventive Action": ncp.preventive_action,
      "Process Lead Comment": ncp.process_comment,
      "Process Approved At": new Date(ncp.process_approved_at).toLocaleString(),
      "Photo Attachment Path": ncp.photo_attachment,
    }));

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pending NCPs");

    // Export the workbook to an Excel file
    XLSX.writeFile(workbook, "pending_ncps_for_approval.xlsx");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "process_approved":
        return <Badge className="bg-purple-100 text-purple-800">Ready for Final Approval</Badge>
      case "manager_approved":
        return <Badge className="bg-green-100 text-green-800">Completed & Archived</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading NCPs for final approval...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="text-gray-600 hover:text-gray-900 p-0 h-auto mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">QA Manager Final Approval</h1>
              <p className="text-gray-600 mt-1">Final review and approval of completed NCP workflows</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {pendingNCPs.length} Pending Final Approval
              </Badge>
              <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </div>
        </div>

        {/* NCP Cards */}
        {pendingNCPs.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Award className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No NCPs for Final Approval</h3>
              <p className="text-gray-600">All NCPs have been processed through the complete workflow.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingNCPs.map((ncp: any) => (
              <Card key={ncp.id} className="bg-white/90 backdrop-blur-md border-0 shadow-xl ring-1 ring-gray-200/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                        {ncp.ncp_id}
                      </Badge>
                      {getStatusBadge(ncp.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Process Approved: {formatToWIB(ncp.process_approved_at)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* NCP Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">SKU Code</div>
                        <div className="font-medium">{ncp.sku_code}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Machine</div>
                        <div className="font-medium">{ncp.machine_code}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Incident Date</div>
                        <div className="font-medium">
                          {new Date(ncp.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Incident Time</div>
                        <div className="font-medium">{ncp.time_incident}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">Process Lead</div>
                        <div className="font-medium">{ncp.process_approved_by}</div>
                      </div>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-200/50">
                    <div className="text-sm font-medium text-gray-700 mb-2">Problem Description:</div>
                    <p className="text-gray-800 text-sm leading-relaxed">{ncp.problem_description}</p>
                  </div>

                  {/* QA Leader Disposition */}
                  {ncp.disposisi && (
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        QA Leader Disposition:
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed mb-4">{ncp.disposisi}</p>

                      {/* Quantities Grid */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                          <div className="text-xs text-gray-500 mb-1">Sortir</div>
                          <div className="text-lg font-bold text-orange-600">{ncp.jumlah_sortir || "0"}</div>
                          <div className="text-xs text-gray-400">{ncp.hold_quantity_uom}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                          <div className="text-xs text-gray-500 mb-1">Release</div>
                          <div className="text-lg font-bold text-green-600">{ncp.jumlah_release || "0"}</div>
                          <div className="text-xs text-gray-400">{ncp.hold_quantity_uom}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-200 text-center">
                          <div className="text-xs text-gray-500 mb-1">Reject</div>
                          <div className="text-lg font-bold text-red-600">{ncp.jumlah_reject || "0"}</div>
                          <div className="text-xs text-gray-400">{ncp.hold_quantity_uom}</div>
                        </div>
                      </div>
                      {/* Total Hold Quantity - Add this after the grid */}
                      <div className="mt-3 p-2 bg-gray-100 rounded text-center">
                        <div className="text-xs text-gray-500">Total Hold Quantity</div>
                        <div className="font-semibold text-gray-800">
                          {ncp.hold_quantity} {ncp.hold_quantity_uom}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Team Leader Analysis */}
                  <div className="p-4 bg-green-50/50 rounded-lg border border-green-200/50">
                    <div className="text-sm font-medium text-gray-700 mb-3">Team Leader Analysis:</div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <Target className="h-3 w-3" />
                          Root Cause Analysis
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed bg-white p-2 rounded border">
                          {ncp.root_cause_analysis}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <Wrench className="h-3 w-3" />
                          Corrective Action
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed bg-white p-2 rounded border">
                          {ncp.corrective_action}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <Shield className="h-3 w-3" />
                          Preventive Action
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed bg-white p-2 rounded border">
                          {ncp.preventive_action}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Process Lead Comment */}
                  {ncp.process_comment && (
                    <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-200/50">
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-600" />
                        Process Lead Approval Comment:
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed bg-white p-2 rounded border">
                        {ncp.process_comment}
                      </p>
                    </div>
                  )}

                  {/* FIXED: Photo Attachment */}
                  {ncp.photo_attachment && (
                    <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Photo Attachment:
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-600 text-sm">{ncp.photo_attachment.split("/").pop()}</p>
                        {/* Display actual image */}
                        <div className="relative w-full max-w-md h-48 bg-gray-100 rounded-lg overflow-hidden border">
                          <img
                            src={`/uploads/${encodeURIComponent(ncp.photo_attachment)}` || "/placeholder.svg"}
                            alt="NCP Photo Attachment"
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Image+Not+Found"
                            }}
                            onClick={() => window.open(`/uploads/${encodeURIComponent(ncp.photo_attachment)}`, "_blank")}
                          />
                        </div>
                        <p className="text-xs text-gray-500">Click image to view full size</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200/50">
                    <Button
                      onClick={() => handleApprove(ncp)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Final Approval & Archive
                    </Button>
                    <Button onClick={() => handleReject(ncp)} variant="destructive" className="flex-1">
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject & Return
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Final Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-600">
              Final Approval: {selectedNCP?.ncp_id}
            </DialogTitle>
            <DialogDescription>
              Complete the NCP workflow with final QA Manager approval. This will archive the NCP.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="finalComment" className="text-sm font-medium">
                Final Approval Comment *
              </Label>
              <Textarea
                id="finalComment"
                placeholder="Enter your final approval comment and any closing remarks..."
                value={finalComment}
                onChange={(e) => setFinalComment(e.target.value)}
                className="min-h-24"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                This comment will complete the NCP workflow and archive the record permanently.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={submitFinalApproval} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Complete & Archive
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">
              Reject Final Approval: {selectedNCP?.ncp_id}
            </DialogTitle>
            <DialogDescription>
              Reject this NCP and return to Team Leader for revision of the analysis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason" className="text-sm font-medium">
                Rejection Reason *
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Explain why this NCP is being rejected and what needs to be improved..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-24"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Provide clear guidance on what needs to be corrected in the analysis or process.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={submitRejection} disabled={isSubmitting} variant="destructive">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject & Return
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-green-600">
              <CheckCircle className="h-6 w-6" />
              Operation Successful
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-base text-gray-700 pt-4">
            {successMessage}
          </DialogDescription>
          <DialogFooter className="mt-6">
            <Button onClick={() => setShowSuccessDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}