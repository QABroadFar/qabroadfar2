// Improved QA Manager Approval Component
// app/dashboard/components/qa-manager-approval.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
  ChevronRight,
  ChevronDown,
  Eye,
  Download,
  Calendar,
  Hash,
  Tag,
  AlertCircle,
  Layers,
  Zap,
  TrendingUp,
  ClipboardCheck,
  Archive,
  RotateCcw,
} from "lucide-react"
import * as XLSX from 'xlsx'
import Image from "next/image"

interface QAManagerApprovalProps {
  onBack: () => void
}

export function QAManagerApproval({ onBack }: QAManagerApprovalProps) {
  const [pendingNCPs, setPendingNCPs] = useState<any[]>([])
  const [selectedNCP, setSelectedNCP] = useState<any>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [previewImage, setPreviewImage] = useState<string | null>(null)

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
        const ncpData = data.data || data
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

  const toggleSection = (ncpId: string, section: string) => {
    const key = `${ncpId}-${section}`
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const isSectionExpanded = (ncpId: string, section: string) => {
    return expandedSections[`${ncpId}-${section}`] || false
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

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
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
      alert("No data to export.")
      return
    }

    const worksheetData = pendingNCPs.map((ncp: any) => ({
      "NCP ID": ncp.ncp_id,
      "SKU Code": ncp.sku_code,
      "Machine Code": ncp.machine_code,
      "Incident Date": new Date(ncp.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      "Incident Time": ncp.time_incident,
      "Process Lead": ncp.process_approved_by,
      "Status": "Ready for Final Approval",
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
    }))

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pending NCPs")
    XLSX.writeFile(workbook, "pending_ncps_for_approval.xlsx")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "process_approved":
        return <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all">Ready for Final Approval</Badge>
      case "manager_approved":
        return <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">Completed & Archived</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityColor = (quantity: number) => {
    if (quantity > 1000) return "text-red-600"
    if (quantity > 500) return "text-orange-600"
    if (quantity > 100) return "text-yellow-600"
    return "text-green-600"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading NCPs for final approval...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="text-gray-600 hover:text-gray-900 hover:bg-white/50 p-0 h-auto mb-6 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                QA Manager Final Approval
              </h1>
              <p className="text-gray-700 mt-2 text-lg">
                Final review and approval of completed NCP workflows
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                <Layers className="h-5 w-5 mr-2" />
                {pendingNCPs.length} Pending
              </Badge>
              
              <Button 
                onClick={exportToExcel} 
                variant="outline" 
                className="flex items-center gap-2 bg-white/80 hover:bg-white shadow-md border-0 backdrop-blur-sm"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {pendingNCPs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm font-medium">Total NCPs</p>
                    <p className="text-2xl font-bold">{pendingNCPs.length}</p>
                  </div>
                  <Layers className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm font-medium">Avg. Hold Qty</p>
                    <p className="text-2xl font-bold">
                      {Math.round(pendingNCPs.reduce((sum, ncp) => sum + (ncp.hold_quantity || 0), 0) / pendingNCPs.length) || 0}
                    </p>
                  </div>
                  <Tag className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm font-medium">Avg. Sortir</p>
                    <p className="text-2xl font-bold">
                      {Math.round(pendingNCPs.reduce((sum, ncp) => sum + (parseInt(ncp.jumlah_sortir || 0)), 0) / pendingNCPs.length) || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm font-medium">Avg. Reject</p>
                    <p className="text-2xl font-bold">
                      {Math.round(pendingNCPs.reduce((sum, ncp) => sum + (parseInt(ncp.jumlah_reject || 0)), 0) / pendingNCPs.length) || 0}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* NCP Cards */}
        {pendingNCPs.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-16 text-center">
              <div className="mx-auto max-w-md">
                <Award className="h-20 w-20 text-green-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No NCPs for Final Approval</h3>
                <p className="text-gray-600 mb-6">
                  All NCPs have been processed through the complete workflow. Great job maintaining quality standards!
                </p>
                <Button 
                  onClick={onBack} 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingNCPs.map((ncp: any) => (
              <Card 
                key={ncp.id} 
                className="bg-white/90 backdrop-blur-md border-0 shadow-xl ring-1 ring-gray-200/50 hover:shadow-2xl transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className="font-mono text-xl px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white"
                      >
                        <Hash className="h-4 w-4 mr-2" />
                        {ncp.ncp_id}
                      </Badge>
                      {getStatusBadge(ncp.status)}
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                        <User className="h-4 w-4 mr-1" />
                        {ncp.process_approved_by}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(ncp.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatToWIB(ncp.process_approved_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* NCP Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200/50">
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Package className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">SKU Code</div>
                        <div className="font-semibold text-gray-900">{ncp.sku_code}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                      <div className="p-2 rounded-lg bg-green-100">
                        <FileText className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Machine</div>
                        <div className="font-semibold text-gray-900">{ncp.machine_code}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <Clock className="h-5 w-5 text-amber-700" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Incident Date</div>
                        <div className="font-semibold text-gray-900">
                          {new Date(ncp.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <Clock className="h-5 w-5 text-purple-700" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Incident Time</div>
                        <div className="font-semibold text-gray-900">{ncp.time_incident}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
                      <div className="p-2 rounded-lg bg-indigo-100">
                        <User className="h-5 w-5 text-indigo-700" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">Process Lead</div>
                        <div className="font-semibold text-gray-900 truncate">{ncp.process_approved_by}</div>
                      </div>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-orange-100">
                        <AlertCircle className="h-5 w-5 text-orange-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Problem Description</h3>
                    </div>
                    <p className="text-gray-900 leading-relaxed bg-white/80 p-4 rounded-lg border border-orange-200">
                      {ncp.problem_description}
                    </p>
                  </div>

                  {/* QA Leader Disposition */}
                  {ncp.disposisi && (
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <ClipboardCheck className="h-5 w-5 text-blue-700" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">QA Leader Disposition</h3>
                      </div>
                      
                      <p className="text-gray-900 leading-relaxed bg-white/80 p-4 rounded-lg border border-blue-200 mb-4">
                        {ncp.disposisi}
                      </p>

                      {/* Quantities Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-white to-orange-50 p-4 rounded-lg border border-orange-200 text-center shadow-sm">
                          <div className="text-sm text-gray-700 mb-2 font-medium">Sortir Quantity</div>
                          <div className={`text-3xl font-bold ${getPriorityColor(parseInt(ncp.jumlah_sortir || 0))}`}>
                            {ncp.jumlah_sortir || "0"}
                          </div>
                          <div className="text-sm text-gray-700">{ncp.hold_quantity_uom}</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-white to-green-50 p-4 rounded-lg border border-green-200 text-center shadow-sm">
                          <div className="text-sm text-gray-700 mb-2 font-medium">Release Quantity</div>
                          <div className={`text-3xl font-bold ${getPriorityColor(parseInt(ncp.jumlah_release || 0))}`}>
                            {ncp.jumlah_release || "0"}
                          </div>
                          <div className="text-sm text-gray-700">{ncp.hold_quantity_uom}</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-white to-red-50 p-4 rounded-lg border border-red-200 text-center shadow-sm">
                          <div className="text-sm text-gray-700 mb-2 font-medium">Reject Quantity</div>
                          <div className={`text-3xl font-bold ${getPriorityColor(parseInt(ncp.jumlah_reject || 0))}`}>
                            {ncp.jumlah_reject || "0"}
                          </div>
                          <div className="text-sm text-gray-700">{ncp.hold_quantity_uom}</div>
                        </div>
                      </div>
                      
                      {/* Total Hold Quantity */}
                      <div className="mt-4 p-4 bg-white/80 rounded-lg border border-gray-200 text-center">
                        <div className="text-sm text-gray-700 mb-1 font-medium">Total Hold Quantity</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {ncp.hold_quantity} <span className="text-lg">{ncp.hold_quantity_uom}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Team Leader Analysis */}
                  <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Zap className="h-5 w-5 text-green-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Team Leader Analysis</h3>
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="root-cause">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-green-700" />
                              <span className="font-medium text-gray-900">Root Cause Analysis</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="p-4 bg-white/80 rounded-lg border border-green-200">
                              <p className="text-gray-900">{ncp.root_cause_analysis}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="corrective">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-4 w-4 text-blue-700" />
                              <span className="font-medium text-gray-900">Corrective Action</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="p-4 bg-white/80 rounded-lg border border-blue-200">
                              <p className="text-gray-900">{ncp.corrective_action}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="preventive">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-purple-700" />
                              <span className="font-medium text-gray-900">Preventive Action</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="p-4 bg-white/80 rounded-lg border border-purple-200">
                              <p className="text-gray-900">{ncp.preventive_action}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                  </div>

                  {/* Process Lead Comment */}
                  {ncp.process_comment && (
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200/50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Award className="h-5 w-5 text-purple-700" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Process Lead Approval Comment</h3>
                      </div>
                      <div className="p-4 bg-white/80 rounded-lg border border-purple-200">
                        <p className="text-gray-900">{ncp.process_comment}</p>
                      </div>
                    </div>
                  )}

                  {/* Photo Attachment */}
                  {ncp.photo_attachment && (
                    <div className="p-5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200/50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <ImageIcon className="h-5 w-5 text-gray-700" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Photo Attachment</h3>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-64 h-48 bg-gray-100 rounded-lg overflow-hidden border">
                          <Image
                            src={`/uploads/${encodeURIComponent(ncp.photo_attachment)}`}
                            alt="NCP Photo Attachment"
                            fill
                            className="object-cover cursor-pointer hover:scale-105 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg?height=200&width=300&text=Image+Not+Found";
                            }}
                            onClick={() => handleImagePreview(`/uploads/${encodeURIComponent(ncp.photo_attachment)}`)}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="p-3 bg-white/80 rounded-lg border">
                            <p className="text-sm text-gray-700 mb-2 font-medium">File Name:</p>
                            <p className="font-medium text-gray-900 break-all">
                              {ncp.photo_attachment.split("/").pop()}
                            </p>
                          </div>
                          
                          <div className="mt-3 flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleImagePreview(`/uploads/${encodeURIComponent(ncp.photo_attachment)}`)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Preview
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/uploads/${encodeURIComponent(ncp.photo_attachment)}`, "_blank")}
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200/50">
                    <Button
                      onClick={() => handleApprove(ncp)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transition-all duration-300 py-6"
                    >
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Final Approval & Archive</span>
                      <Archive className="h-5 w-5 ml-2" />
                    </Button>
                    
                    <Button 
                      onClick={() => handleReject(ncp)} 
                      variant="destructive" 
                      className="flex-1 py-6"
                    >
                      <ThumbsDown className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Reject & Return</span>
                      <RotateCcw className="h-5 w-5 ml-2" />
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
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-700 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Final Approval: {selectedNCP?.ncp_id}
            </DialogTitle>
            <DialogDescription className="text-gray-700">
              Complete the NCP workflow with final QA Manager approval. This will archive the NCP permanently.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="finalComment" className="text-sm font-medium text-gray-800">
                Final Approval Comment *
              </Label>
              <Textarea
                id="finalComment"
                placeholder="Enter your final approval comment and any closing remarks..."
                value={finalComment}
                onChange={(e) => setFinalComment(e.target.value)}
                className="min-h-32 border-gray-300 focus:border-green-500 focus:ring-green-500"
                rows={5}
              />
              <p className="text-xs text-gray-600">
                This comment will complete the NCP workflow and archive the record permanently.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowApprovalDialog(false)} 
              disabled={isSubmitting}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={submitFinalApproval} 
              disabled={isSubmitting} 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
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
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-700 flex items-center gap-2">
              <XCircle className="h-6 w-6" />
              Reject Final Approval: {selectedNCP?.ncp_id}
            </DialogTitle>
            <DialogDescription className="text-gray-700">
              Reject this NCP and return to Team Leader for revision of the analysis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason" className="text-sm font-medium text-gray-800">
                Rejection Reason *
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Explain why this NCP is being rejected and what needs to be improved..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-32 border-gray-300 focus:border-red-500 focus:ring-red-500"
                rows={5}
              />
              <p className="text-xs text-gray-600">
                Provide clear guidance on what needs to be corrected in the analysis or process.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowRejectionDialog(false)} 
              disabled={isSubmitting}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={submitRejection} 
              disabled={isSubmitting} 
              variant="destructive"
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
            >
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
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-2xl font-bold text-green-700">
              <CheckCircle className="h-8 w-8" />
              Operation Successful
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-800 pt-4 text-lg">
              {successMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction 
              onClick={() => setShowSuccessDialog(false)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl bg-black/90 border-0 p-0">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {previewImage && (
              <Image
                src={previewImage}
                alt="NCP Photo Preview"
                fill
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg?height=400&width=600&text=Image+Not+Available";
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}