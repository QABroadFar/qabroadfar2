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
} from "lucide-react"

interface ProcessLeadApprovalProps {
  onBack: () => void
}

export function ProcessLeadApproval({ onBack }: ProcessLeadApprovalProps) {
  const [pendingNCPs, setPendingNCPs] = useState<any[]>([])
  const [selectedNCP, setSelectedNCP] = useState<any>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [approvalComment, setApprovalComment] = useState("")
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
        // Filter for NCPs that have been processed by Team Leader
        const processReady = Array.isArray(ncpData) ? ncpData.filter((ncp: any) => ncp.status === "tl_processed") : []
        setPendingNCPs(processReady)
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
    setApprovalComment("")
    setShowApprovalDialog(true)
  }

  const handleReject = (ncp: any) => {
    setSelectedNCP(ncp)
    setRejectionReason("")
    setShowRejectionDialog(true)
  }

  const submitApproval = async () => {
    if (!selectedNCP || !approvalComment.trim()) {
      alert("Please provide an approval comment")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/ncp/approve-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedNCP.id,
          action: "approve",
          comment: approvalComment,
        }),
      })

      if (response.ok) {
        setShowApprovalDialog(false)
        setSuccessMessage(`NCP ${selectedNCP.ncp_id} approved successfully and forwarded to QA Manager!`)
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
      const response = await fetch("/api/ncp/approve-process", {
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
        setSuccessMessage(`NCP ${selectedNCP.ncp_id} rejected and returned to Team Leader!`)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "tl_processed":
        return <Badge className="bg-blue-900/50 text-blue-300 border border-blue-500/30">Ready for Process Review</Badge>
      case "process_approved":
        return <Badge className="bg-green-900/50 text-green-300 border border-green-500/30">Process Approved</Badge>
      default:
        return <Badge variant="secondary" className="glass-panel">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 gradient-bg min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <span className="ml-2 text-blue-200">Loading NCPs for process review...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 gradient-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => onBack()} className="text-blue-200 hover:text-blue-50 p-0 h-auto mb-4 glass-panel">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold futuristic-heading">Process Lead Approval</h1>
              <p className="text-blue-200 mt-1">Review and approve processed NCP reports</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2 glass-panel border-cyan-500/30">
              {pendingNCPs.length} Pending Review
            </Badge>
          </div>
        </div>

        {/* NCP Cards */}
        {pendingNCPs.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold futuristic-subheading mb-2">No NCPs for Review</h3>
              <p className="text-blue-200">All processed NCPs have been reviewed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingNCPs.map((ncp: any) => (
              <Card key={ncp.id} className="glass-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-lg px-3 py-1 glass-panel border-cyan-500/30 text-blue-200">
                        {ncp.ncp_id}
                      </Badge>
                      {getStatusBadge(ncp.status)}
                    </div>
                    <div className="text-sm text-blue-300">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Processed: {formatToWIB(ncp.tl_processed_at)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* NCP Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 glass-panel p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-300" />
                      <div>
                        <div className="text-xs text-blue-300">SKU Code</div>
                        <div className="font-medium text-blue-100">{ncp.sku_code}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-300" />
                      <div>
                        <div className="text-xs text-blue-300">Machine</div>
                        <div className="font-medium text-blue-100">{ncp.machine_code}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-300" />
                      <div>
                        <div className="text-xs text-blue-300">Incident Date</div>
                        <div className="font-medium text-blue-100">
                          {new Date(ncp.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-300" />
                      <div>
                        <div className="text-xs text-blue-300">Incident Time</div>
                        <div className="font-medium text-blue-100">{ncp.time_incident}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-300" />
                      <div>
                        <div className="text-xs text-blue-300">Team Leader</div>
                        <div className="font-medium text-blue-100">{ncp.tl_processed_by}</div>
                      </div>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="p-4 glass-panel rounded-lg border border-orange-500/20">
                    <div className="text-sm font-medium text-blue-200 mb-2">Problem Description:</div>
                    <p className="text-blue-100 text-sm leading-relaxed">{ncp.problem_description}</p>
                  </div>

                  {/* QA Leader Disposition */}
                  {ncp.disposisi && (
                    <div className="p-4 glass-panel rounded-lg border border-blue-500/20">
                      <div className="text-sm font-medium text-blue-200 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-cyan-400" />
                        QA Leader Disposition:
                      </div>
                      <p className="text-blue-100 text-sm leading-relaxed mb-4">{ncp.disposisi}</p>

                      {/* Quantities Grid - More prominent display */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="glass-panel p-3 rounded-lg text-center border border-cyan-500/20">
                          <div className="text-xs text-blue-300 mb-1">Sortir</div>
                          <div className="text-lg font-bold text-orange-400">{ncp.jumlah_sortir || "0"}</div>
                          <div className="text-xs text-blue-400">{ncp.hold_quantity_uom}</div>
                        </div>
                        <div className="glass-panel p-3 rounded-lg text-center border border-cyan-500/20">
                          <div className="text-xs text-blue-300 mb-1">Release</div>
                          <div className="text-lg font-bold text-green-400">{ncp.jumlah_release || "0"}</div>
                          <div className="text-xs text-blue-400">{ncp.hold_quantity_uom}</div>
                        </div>
                        <div className="glass-panel p-3 rounded-lg text-center border border-cyan-500/20">
                          <div className="text-xs text-blue-300 mb-1">Reject</div>
                          <div className="text-lg font-bold text-red-400">{ncp.jumlah_reject || "0"}</div>
                          <div className="text-xs text-blue-400">{ncp.hold_quantity_uom}</div>
                        </div>
                      </div>

                      {/* Total Hold Quantity */}
                      <div className="mt-3 p-2 glass-panel rounded text-center border border-cyan-500/20">
                        <div className="text-xs text-blue-300">Total Hold Quantity</div>
                        <div className="font-semibold text-blue-100">
                          {ncp.hold_quantity} {ncp.hold_quantity_uom}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Team Leader Analysis */}
                  <div className="p-4 glass-panel rounded-lg border border-green-500/20">
                    <div className="text-sm font-medium text-blue-200 mb-3">Team Leader Analysis:</div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-blue-300 mb-1">
                          <Target className="h-3 w-3" />
                          Root Cause Analysis
                        </div>
                        <p className="text-blue-100 text-sm leading-relaxed glass-panel p-2 rounded border border-cyan-500/20">
                          {ncp.root_cause_analysis}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs text-blue-300 mb-1">
                          <Wrench className="h-3 w-3" />
                          Corrective Action
                        </div>
                        <p className="text-blue-100 text-sm leading-relaxed glass-panel p-2 rounded border border-cyan-500/20">
                          {ncp.corrective_action}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs text-blue-300 mb-1">
                          <Shield className="h-3 w-3" />
                          Preventive Action
                        </div>
                        <p className="text-blue-100 text-sm leading-relaxed glass-panel p-2 rounded border border-cyan-500/20">
                          {ncp.preventive_action}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Photo Attachment */}
                  {ncp.photo_attachment && (
                    <div className="p-4 glass-panel rounded-lg border border-purple-500/20">
                      <div className="text-sm font-medium text-blue-200 mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Photo Attachment:
                      </div>
                      <div className="space-y-2">
                        <p className="text-blue-200 text-sm">{ncp.photo_attachment.split("/").pop()}</p>
                        {/* Display actual image */}
                        <div className="relative w-full max-w-md h-48 glass-panel rounded-lg overflow-hidden border border-cyan-500/20">
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
                        <p className="text-xs text-blue-400">Click image to view full size</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-cyan-500/20">
                    <Button
                      onClick={() => handleApprove(ncp)}
                      className="flex-1 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve Process
                    </Button>
                    <Button onClick={() => handleReject(ncp)} variant="destructive" className="flex-1 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white">
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

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl glass-card border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-400 futuristic-heading">
              Approve Process: {selectedNCP?.ncp_id}
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Approve this NCP process analysis and forward to QA Manager for final approval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approvalComment" className="text-sm font-medium text-blue-200">
                Process Approval Comment *
              </Label>
              <Textarea
                id="approvalComment"
                placeholder="Enter your approval comment and any additional notes..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="min-h-24 glass-panel border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400 text-blue-100 placeholder:text-blue-300/50"
                rows={4}
              />
              <p className="text-xs text-blue-400">
                This comment will be visible to the QA Manager and will be part of the permanent record.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-cyan-500/20 pt-4">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)} disabled={isSubmitting} className="glass-panel border-cyan-500/30 text-blue-200 hover:bg-cyan-500/20">
              Cancel
            </Button>
            <Button onClick={submitApproval} disabled={isSubmitting} className="bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Forward
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="max-w-2xl glass-card border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-400 futuristic-heading">Reject Process: {selectedNCP?.ncp_id}</DialogTitle>
            <DialogDescription className="text-blue-200">
              Reject this NCP process analysis and return to Team Leader for revision.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason" className="text-sm font-medium text-blue-200">
                Rejection Reason *
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Explain why this process analysis is being rejected and what needs to be improved..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-24 glass-panel border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400 text-blue-100 placeholder:text-blue-300/50"
                rows={4}
              />
              <p className="text-xs text-blue-400">
                Provide clear guidance on what needs to be corrected or improved in the analysis.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 border-t border-cyan-500/20 pt-4">
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)} disabled={isSubmitting} className="glass-panel border-cyan-500/30 text-blue-200 hover:bg-cyan-500/20">
              Cancel
            </Button>
            <Button onClick={submitRejection} disabled={isSubmitting} variant="destructive" className="bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white">
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
        <DialogContent className="max-w-md glass-card border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-400 futuristic-heading flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Success!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-blue-200">{successMessage}</p>
          </div>
          <DialogFooter className="border-t border-cyan-500/20 pt-4">
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
