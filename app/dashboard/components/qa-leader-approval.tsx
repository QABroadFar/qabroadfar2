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
import { ArrowLeft, CheckCircle, XCircle, Loader2, User, Package, FileText, Clock, ImageIcon, Download, Search, AlertCircle, Calendar } from "lucide-react"
import { formatToWIB, formatSubmissionDate } from "@/lib/date-utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface QALeaderApprovalProps {
  onBack: () => void
}

export function QALeaderApproval({ onBack }: QALeaderApprovalProps) {
  const [pendingNCPs, setPendingNCPs] = useState<any[]>([])
  const [selectedNCP, setSelectedNCP] = useState<any>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false) // State for success dialog
  const [successMessage, setSuccessMessage] = useState("") // State for success message
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [teamLeaders, setTeamLeaders] = useState<{id: number, username: string, full_name?: string}[]>([
    {id: 1, username: "teamlead1", full_name: "Team Leader 1"},
    {id: 2, username: "teamlead2", full_name: "Team Leader 2"},
    {id: 3, username: "teamlead3", full_name: "Team Leader 3"}
  ])
  const [isLoadingTeamLeaders, setIsLoadingTeamLeaders] = useState(false)
  const [approvalData, setApprovalData] = useState({
    disposisi: "",
    jumlahSortir: "",
    jumlahRelease: "",
    jumlahReject: "",
    assignedTeamLeader: "",
  })
  const [rejectionReason, setRejectionReason] = useState("")

  // Load Team Leaders from localStorage if available
  useEffect(() => {
    const savedTeamLeaders = localStorage.getItem("teamLeaders")
    if (savedTeamLeaders) {
      setTeamLeaders(JSON.parse(savedTeamLeaders))
    }
  }, [])

  // Fetch pending NCPs when component mounts
  useEffect(() => {
    fetchPendingNCPs()
  }, [])

  const fetchPendingNCPs = async () => {
    try {
      console.log("Fetching pending NCPs for QA Leader");
      setIsLoading(true)
      const response = await fetch("/api/dashboard/ncps?pending=true")
      console.log("API response status:", response.status);
      if (response.ok) {
        const data = await response.json()
        console.log("Raw API data:", data);
        // Handle both API response formats
        const ncpData = data.data || data
        console.log("Processed NCP data:", ncpData);
        const filteredNCPs = Array.isArray(ncpData) ? ncpData.filter((ncp: any) => ncp.status === "pending") : []
        console.log("Filtered pending NCPs:", filteredNCPs);
        setPendingNCPs(filteredNCPs)
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
        setSuccessMessage(`NCP ${selectedNCP.ncp_id} approved successfully and assigned to Team Leader!`)
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
        alert("NCP rejected successfully!") // Keep original alert for rejection
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


  if (isLoading) {
    return (
      <div className="p-6 gradient-bg min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <span className="ml-2 text-blue-200">Loading pending NCPs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 gradient-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="text-blue-200 hover:text-blue-50 p-0 h-auto mb-4 glass-panel">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold futuristic-heading">QA Leader Approval</h1>
              <p className="text-blue-200 mt-1">Review and approve pending NCP reports</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2 glass-panel border-cyan-500/30">
              {pendingNCPs.length} Pending
            </Badge>
          </div>
        </div>

        {/* NCP Cards */}
        {pendingNCPs.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold futuristic-subheading mb-2">No Pending NCPs</h3>
              <p className="text-blue-200">All NCP reports have been reviewed.</p>
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
                      <Badge className="bg-yellow-900/50 text-yellow-300 border border-yellow-500/30">Pending Review</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {formatSubmissionDate(ncp.submitted_at)}
qwen                    </div>
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
                        <div className="text-xs text-blue-300">Submitted By</div>
                        <div className="font-medium text-blue-100">{ncp.submitted_by}</div>
                      </div>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="p-4 glass-panel rounded-lg border border-orange-500/20">
                    <div className="text-sm font-medium text-blue-200 mb-2">Problem Description:</div>
                    <p className="text-blue-100 text-sm leading-relaxed">{ncp.problem_description}</p>
                  </div>

                  {/* Photo Attachment Display */}
                  {ncp.photo_attachment && (
                    <div className="p-4 glass-panel rounded-lg border border-purple-500/20">
                      <div className="text-sm font-medium text-blue-200 mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Photo Attachment:
                      </div>
                      <div className="space-y-2">
                        <p className="text-blue-200 text-sm">{ncp.photo_attachment}</p>
                        {/* Display actual image */}
                        <div className="relative w-full max-w-md h-48 glass-panel rounded-lg overflow-hidden border border-cyan-500/20">
                          <img
                            src={`/api/ncp/image?filename=${ncp.photo_attachment}`}
                            alt="NCP Photo Attachment"
                            className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Image+Not+Found"
                            }}
                            onClick={() => window.open(`/api/ncp/image?filename=${ncp.photo_attachment}`, "_blank")}
                          />
                        </div>
                        <a 
                          href={`/api/ncp/image?filename=${ncp.photo_attachment}`} 
                          download={ncp.photo_attachment}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-700 to-blue-700 text-white rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all"
                        >
                          <Download className="h-4 w-4" />
                          Download Image
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-cyan-500/20">
                    <Button
                      onClick={() => handleApprove(ncp)}
                      className="flex-1 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button onClick={() => handleReject(ncp)} variant="destructive" className="flex-1 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white">
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
        <DialogContent className="max-w-2xl glass-card border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-400 futuristic-heading">Approve NCP: {selectedNCP?.ncp_id}</DialogTitle>
            <DialogDescription className="text-blue-200">
              Provide disposition details and assign to a team leader for RCA analysis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="disposisi" className="text-sm font-medium text-blue-200">
                Disposition *
              </Label>
              <Textarea
                id="disposisi"
                placeholder="Enter disposition details..."
                value={approvalData.disposisi}
                onChange={(e) => setApprovalData((prev) => ({ ...prev, disposisi: e.target.value }))}
                className="min-h-24 glass-panel border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400 text-blue-100 placeholder:text-blue-300/50"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jumlahSortir" className="text-sm font-medium text-blue-200">
                  Jumlah Sortir ({selectedNCP?.hold_quantity_uom || "units"})
                </Label>
                <Input
                  id="jumlahSortir"
                  placeholder="0"
                  value={approvalData.jumlahSortir}
                  onChange={(e) => setApprovalData((prev) => ({ ...prev, jumlahSortir: e.target.value }))}
                  className="glass-panel border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400 text-blue-100 placeholder:text-blue-300/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlahRelease" className="text-sm font-medium text-blue-200">
                  Jumlah Release ({selectedNCP?.hold_quantity_uom || "units"})
                </Label>
                <Input
                  id="jumlahRelease"
                  placeholder="0"
                  value={approvalData.jumlahRelease}
                  onChange={(e) => setApprovalData((prev) => ({ ...prev, jumlahRelease: e.target.value }))}
                  className="glass-panel border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400 text-blue-100 placeholder:text-blue-300/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlahReject" className="text-sm font-medium text-blue-200">
                  Jumlah Reject ({selectedNCP?.hold_quantity_uom || "units"})
                </Label>
                <Input
                  id="jumlahReject"
                  placeholder="0"
                  value={approvalData.jumlahReject}
                  onChange={(e) => setApprovalData((prev) => ({ ...prev, jumlahReject: e.target.value }))}
                  className="glass-panel border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400 text-blue-100 placeholder:text-blue-300/50"
                />
              </div>
            </div>

            {/* Total Hold Quantity Display */}
            <div className="mt-4 p-3 glass-panel rounded-lg border border-cyan-500/20">
              <div className="text-sm text-blue-200 text-center">
                <strong>Total Hold Quantity:</strong> {selectedNCP?.hold_quantity} {selectedNCP?.hold_quantity_uom}
              </div>
              <div className="text-xs text-blue-400 text-center mt-1">
                Ensure Sortir + Release + Reject = Total Hold Quantity
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTeamLeader" className="text-sm font-medium text-blue-200">
                Assign to Team Leader *
              </Label>
              <Select
                value={approvalData.assignedTeamLeader}
                onValueChange={(value) => setApprovalData((prev) => ({ ...prev, assignedTeamLeader: value }))}
              >
                <SelectTrigger className="glass-panel border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400 text-blue-100">
                  <SelectValue placeholder="Select team leader" className="text-blue-100" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-cyan-500/30">
                  {isLoadingTeamLeaders ? (
                    <SelectItem value="loading" disabled className="text-blue-100">
                      Loading Team Leaders...
                    </SelectItem>
                  ) : (
                    teamLeaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.username} className="text-blue-100 hover:bg-cyan-500/20">
                        {leader.full_name || leader.username}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
                "Approve & Assign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="max-w-md glass-card border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-400 futuristic-heading">Reject NCP: {selectedNCP?.ncp_id}</DialogTitle>
            <DialogDescription className="text-blue-200">Please provide a reason for rejecting this NCP report.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason" className="text-sm font-medium text-blue-200">
                Rejection Reason *
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-24 glass-panel border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400 text-blue-100 placeholder:text-blue-300/50"
                rows={4}
              />
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
                "Reject NCP"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md glass-card border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-400 futuristic-heading">Success!</DialogTitle>
            <DialogDescription className="text-blue-200">{successMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 border-t border-cyan-500/20 pt-4">
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
