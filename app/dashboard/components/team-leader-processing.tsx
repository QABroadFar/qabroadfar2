"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatToWIB } from "@/lib/date-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  User,
  Package,
  FileText,
  Target,
  Wrench,
  Shield,
  Send,
  Eye,
  Clock,
  ImageIcon,
} from "lucide-react"

interface TeamLeaderProcessingProps {
  onBack: () => void
  userInfo?: {
    id: number
    username: string
    role: string
  }
}

export function TeamLeaderProcessing({ onBack, userInfo }: TeamLeaderProcessingProps) {
  const [assignedNCPs, setAssignedNCPs] = useState([])
  const [selectedNCP, setSelectedNCP] = useState(null)
  const [showProcessDialog, setShowProcessDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Processing form data
  const [processData, setProcessData] = useState({
    rootCauseAnalysis: "",
    correctiveAction: "",
    preventiveAction: "",
  })

  useEffect(() => {
    fetchAssignedNCPs()
  }, [])

  const fetchAssignedNCPs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/dashboard/ncps?pending=true")
      if (response.ok) {
        const data = await response.json()
        // Handle both API response formats
        const ncpData = data.data || data
        
        // Filter for NCPs assigned to current team leader with qa_approved status only (not processed)
        const assignedToMe = Array.isArray(ncpData) ? ncpData.filter(
          (ncp: any) =>
            ncp.status === "qa_approved" &&
            ncp.assigned_team_leader === userInfo?.username
        ) : []
        setAssignedNCPs(assignedToMe)
      } else {
        console.error("Failed to fetch assigned NCPs")
      }
    } catch (error) {
      console.error("Error fetching assigned NCPs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcess = (ncp: any) => {
    setSelectedNCP(ncp)
    setProcessData({
      rootCauseAnalysis: ncp.root_cause_analysis || "",
      correctiveAction: ncp.corrective_action || "",
      preventiveAction: ncp.preventive_action || "",
    })
    setShowProcessDialog(true)
  }

  const submitProcessing = async () => {
    if (
      !selectedNCP ||
      !processData.rootCauseAnalysis.trim() ||
      !processData.correctiveAction.trim() ||
      !processData.preventiveAction.trim()
    ) {
      alert("Please fill all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/ncp/process-tl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedNCP.id,
          processData,
        }),
      })

      if (response.ok) {
        setShowProcessDialog(false)
        setSuccessMessage(`NCP ${selectedNCP.ncp_id} processed successfully and forwarded to Process Lead!`)
        setShowSuccessDialog(true)
        fetchAssignedNCPs()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error processing NCP:", error)
      alert("Failed to process NCP")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return formatToWIB(dateString)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "qa_approved":
        return <Badge className="bg-blue-100 text-blue-800">Ready for Processing</Badge>
      case "tl_processed":
        return <Badge className="bg-green-100 text-green-800">Processed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading assigned NCPs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => onBack()} className="text-gray-600 hover:text-gray-900 p-0 h-auto mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Team Leader Processing</h1>
              <p className="text-gray-600 mt-1">Process assigned NCP reports with RCA analysis</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {assignedNCPs.filter((ncp: any) => ncp.status === "qa_approved").length} Pending
            </Badge>
          </div>
        </div>

        {/* NCP Cards */}
        {assignedNCPs.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Pending NCPs</h3>
              <p className="text-gray-600">All assigned NCP reports have been processed successfully.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {assignedNCPs.map((ncp: any) => (
              <Card key={ncp.id} className="bg-white/90 backdrop-blur-md border-0 shadow-xl ring-1 ring-gray-200/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                        {ncp.ncp_id}
                      </Badge>
                      {getStatusBadge(ncp.status)}
                    </div>
                    <div className="text-sm text-gray-500">Approved: {formatDate(ncp.qa_approved_at)}</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* NCP Details Grid */}
                  {/* NCP Details Grid - Enhanced with incident date/time */}
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
                      <div>
                        <div className="text-xs text-gray-500">Incident Time</div>
                        <div className="font-medium">{ncp.time_incident}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-500">QA Leader</div>
                        <div className="font-medium">{ncp.qa_approved_by}</div>
                      </div>
                    </div>
                  </div>

                  {/* QA Leader Approval Details */}
                  {/* QA Leader Approval Details - Enhanced display */}
                  {ncp.disposisi && (
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        QA Leader Disposition:
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed mb-4">{ncp.disposisi}</p>
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

                  {/* Problem Description */}
                  <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-200/50">
                    <div className="text-sm font-medium text-gray-700 mb-2">Problem Description:</div>
                    <p className="text-gray-800 text-sm leading-relaxed">{ncp.problem_description}</p>
                  </div>

                  {/* Photo Attachment */}
                  {ncp.photo_attachment && (
                    <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-200/50">
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Photo Attachment:
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-600 text-sm">{ncp.photo_attachment.split("/").pop()}</p>
                        {/* Display actual image */}
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

                  {/* Processing Status */}
                  {ncp.status === "tl_processed" && (
                    <div className="p-4 bg-green-50/50 rounded-lg border border-green-200/50">
                      <div className="text-sm font-medium text-green-700 mb-2">
                        ✅ Processed on {formatDate(ncp.tl_processed_at)}
                      </div>
                      <div className="text-sm text-gray-600">
                        This NCP has been processed and forwarded to Process Lead for final review.
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200/50">
                    {ncp.status === "qa_approved" ? (
                      <Button
                        onClick={() => handleProcess(ncp)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Process RCA
                      </Button>
                    ) : (
                      <Button onClick={() => handleProcess(ncp)} variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Processing Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processing Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-600">Process NCP: {selectedNCP?.ncp_id}</DialogTitle>
            <DialogDescription>
              Complete the Root Cause Analysis, Corrective Action, and Preventive Action for this NCP.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="rca" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rca" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Root Cause Analysis
              </TabsTrigger>
              <TabsTrigger value="corrective" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Corrective Action
              </TabsTrigger>
              <TabsTrigger value="preventive" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Preventive Action
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rca" className="space-y-4">
              <div className="p-4 bg-red-50/50 rounded-lg border border-red-200/50">
                <h3 className="font-semibold text-gray-800 mb-2">Root Cause Analysis</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Identify the fundamental cause(s) that led to this non-conformance. Use systematic analysis methods
                  like 5 Whys, Fishbone diagram, etc.
                </p>
                <Textarea
                  placeholder="Enter detailed root cause analysis..."
                  value={processData.rootCauseAnalysis}
                  onChange={(e) => setProcessData((prev) => ({ ...prev, rootCauseAnalysis: e.target.value }))}
                  className="min-h-32"
                  rows={8}
                />
              </div>
            </TabsContent>

            <TabsContent value="corrective" className="space-y-4">
              <div className="p-4 bg-yellow-50/50 rounded-lg border border-yellow-200/50">
                <h3 className="font-semibold text-gray-800 mb-2">Corrective Action</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Define immediate actions to eliminate the identified root cause and prevent recurrence of this
                  specific problem.
                </p>
                <Textarea
                  placeholder="Enter corrective actions to be taken..."
                  value={processData.correctiveAction}
                  onChange={(e) => setProcessData((prev) => ({ ...prev, correctiveAction: e.target.value }))}
                  className="min-h-32"
                  rows={8}
                />
              </div>
            </TabsContent>

            <TabsContent value="preventive" className="space-y-4">
              <div className="p-4 bg-green-50/50 rounded-lg border border-green-200/50">
                <h3 className="font-semibold text-gray-800 mb-2">Preventive Action</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Outline systematic actions to prevent similar non-conformances from occurring in the future across all
                  similar processes.
                </p>
                <Textarea
                  placeholder="Enter preventive measures and system improvements..."
                  value={processData.preventiveAction}
                  onChange={(e) => setProcessData((prev) => ({ ...prev, preventiveAction: e.target.value }))}
                  className="min-h-32"
                  rows={8}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => setShowProcessDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            {selectedNCP?.status === "qa_approved" && (
              <Button onClick={submitProcessing} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit to Process Lead
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-600 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Success!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">{successMessage}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full bg-green-600 hover:bg-green-700">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
