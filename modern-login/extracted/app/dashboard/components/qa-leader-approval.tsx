"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, CheckCircle, XCircle, Loader2, User, Package, FileText, Clock, ImageIcon } from "lucide-react"

interface QALeaderApprovalProps {
  onBack: () => void
}

const teamLeaderOptions = ["teamlead1", "teamlead2", "teamlead3"]

export function QALeaderApproval({ onBack }: QALeaderApprovalProps) {
  const [pendingNCPs, setPendingNCPs] = useState([])
  const [selectedNCP, setSelectedNCP] = useState(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Approval form data
  const [approvalData, setApprovalData] = useState({
    disposisi: "",
    jumlahSortir: "",
    jumlahRelease: "",
    jumlahReject: "",
    assignedTeamLeader: "",
  })

  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchPendingNCPs()
  }, [])

  const fetchPendingNCPs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/ncp/list?type=pending")
      if (response.ok) {
        const data = await response.json()
        setPendingNCPs(data.data.filter((ncp: any) => ncp.status === "pending"))
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
    setApprovalData({
      disposisi: "",
      jumlahSortir: "",
      jumlahRelease: "",
      jumlahReject: "",
      assignedTeamLeader: "",
    })
    setShowApprovalDialog(true)
  }

  const handleReject = (ncp: any) => {
    setSelectedNCP(ncp)
    setRejectionReason("")
    setShowRejectionDialog(true)
  }

  const submitApproval = async () => {
    if (!selectedNCP || !approvalData.disposisi.trim() || !approvalData.assignedTeamLeader) {
      alert("Please fill all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/ncp/approve-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedNCP.id,
          action: "approve",
          approvalData,
        }),
      })

      if (response.ok) {
        setShowApprovalDialog(false)
        fetchPendingNCPs()
        alert("NCP approved successfully!")
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
      const response = await fetch("/api/ncp/approve-qa", {
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
        fetchPendingNCPs()
        alert("NCP rejected successfully!")
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading pending NCPs...</span>
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
              <h1 className="text-3xl font-bold text-gray-800">QA Leader Approval</h1>
              <p className="text-gray-600 mt-1">Review and approve pending NCP reports</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {pendingNCPs.length} Pending
            </Badge>
          </div>
        </div>

        {/* NCP Cards */}
        {pendingNCPs.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Pending NCPs</h3>
              <p className="text-gray-600">All NCP reports have been reviewed.</p>
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
                      <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {formatDate(ncp.submitted_at)}
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
                        <div className="text-xs text-gray-500">Submitted By</div>
                        <div className="font-medium">{ncp.submitted_by}</div>
                      </div>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-200/50">
                    <div className="text-sm font-medium text-gray-700 mb-2">Problem Description:</div>
                    <p className="text-gray-800 text-sm leading-relaxed">{ncp.problem_description}</p>
                  </div>

                  {/* FIXED: Photo Attachment Display */}
                  {ncp.photo_attachment && (
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Photo Attachment:
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-600 text-sm">{ncp.photo_attachment.split("/").pop()}</p>
                        {/* FIXED: Display actual image */}
                        <div className="relative w-full max-w-md h-48 bg-gray-100 rounded-lg overflow-hidden border">
                          <img
                            src={ncp.photo_attachment || "/placeholder.svg"}
                            alt="NCP Photo Attachment"
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Image+Not+Found"
                            }}
                            onClick={() => window.open(ncp.photo_attachment, "_blank")}
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
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button onClick={() => handleReject(ncp)} variant="destructive" className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-600">Approve NCP: {selectedNCP?.ncp_id}</DialogTitle>
            <DialogDescription>
              Provide disposition details and assign to a team leader for RCA analysis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="disposisi" className="text-sm font-medium">
                Disposition *
              </Label>
              <Textarea
                id="disposisi"
                placeholder="Enter disposition details..."
                value={approvalData.disposisi}
                onChange={(e) => setApprovalData((prev) => ({ ...prev, disposisi: e.target.value }))}
                className="min-h-24"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jumlahSortir" className="text-sm font-medium">
                  Jumlah Sortir ({selectedNCP?.hold_quantity_uom || "units"})
                </Label>
                <Input
                  id="jumlahSortir"
                  placeholder="0"
                  value={approvalData.jumlahSortir}
                  onChange={(e) => setApprovalData((prev) => ({ ...prev, jumlahSortir: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlahRelease" className="text-sm font-medium">
                  Jumlah Release ({selectedNCP?.hold_quantity_uom || "units"})
                </Label>
                <Input
                  id="jumlahRelease"
                  placeholder="0"
                  value={approvalData.jumlahRelease}
                  onChange={(e) => setApprovalData((prev) => ({ ...prev, jumlahRelease: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlahReject" className="text-sm font-medium">
                  Jumlah Reject ({selectedNCP?.hold_quantity_uom || "units"})
                </Label>
                <Input
                  id="jumlahReject"
                  placeholder="0"
                  value={approvalData.jumlahReject}
                  onChange={(e) => setApprovalData((prev) => ({ ...prev, jumlahReject: e.target.value }))}
                />
              </div>
            </div>

            {/* Total Hold Quantity Display */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="text-sm text-gray-600 text-center">
                <strong>Total Hold Quantity:</strong> {selectedNCP?.hold_quantity} {selectedNCP?.hold_quantity_uom}
              </div>
              <div className="text-xs text-gray-500 text-center mt-1">
                Ensure Sortir + Release + Reject = Total Hold Quantity
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTeamLeader" className="text-sm font-medium">
                Assign to Team Leader *
              </Label>
              <Select
                value={approvalData.assignedTeamLeader}
                onValueChange={(value) => setApprovalData((prev) => ({ ...prev, assignedTeamLeader: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team leader" />
                </SelectTrigger>
                <SelectContent>
                  {teamLeaderOptions.map((leader) => (
                    <SelectItem key={leader} value={leader}>
                      {leader}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={submitApproval} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve & Assign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Reject NCP: {selectedNCP?.ncp_id}</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this NCP report.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason" className="text-sm font-medium">
                Rejection Reason *
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-24"
                rows={4}
              />
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
                "Reject NCP"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
