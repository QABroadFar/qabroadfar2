
"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatToWIB, formatSubmissionDate } from "@/lib/date-utils"
import {
  ArrowLeft,
  Search,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  FileText,
  ArrowRight,
  Package,
  ImageIcon,
} from "lucide-react"

interface NCPFlowTrackerProps {
  userInfo: {
    id: number
    username: string
    role: string
  }
}

interface NCPReport {
  id: number
  ncp_id: string
  sku_code: string
  machine_code: string
  date: string
  time_incident: string
  hold_quantity: number
  hold_quantity_uom: string
  problem_description: string
  photo_attachment: string | null
  qa_leader: string
  status: string
  submitted_by: string
  submitted_at: string
  qa_approved_by: string | null
  qa_approved_at: string | null
  disposisi: string | null
  jumlah_sortir: string
  jumlah_release: string
  jumlah_reject: string
  assigned_team_leader: string | null
  qa_rejection_reason: string | null
  tl_processed_by: string | null
  tl_processed_at: string | null
  root_cause_analysis: string | null
  corrective_action: string | null
  preventive_action: string | null
  process_approved_by: string | null
  process_approved_at: string | null
  process_rejection_reason: string | null
  process_comment: string | null
  manager_approved_by: string | null
  manager_approved_at: string | null
  manager_rejection_reason: string | null
  manager_comment: string | null
  archived_at: string | null
}

export function NCPFlowTracker({ userInfo }: NCPFlowTrackerProps) {
  const [ncps, setNCPs] = useState<NCPReport[]>([])
  const [filteredNCPs, setFilteredNCPs] = useState<NCPReport[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAllNCPs()
  }, [])

  useEffect(() => {
    filterNCPs()
  }, [searchTerm, selectedStatus, ncps])

  const fetchAllNCPs = async () => {
    try {
      setIsLoading(true)
      
      // Determine which API to call based on user role
      let apiUrl = "/api/dashboard/ncps"
      if (userInfo.role === "super_admin") {
        apiUrl = "/api/ncp/list"
      }
      
      const response = await fetch(apiUrl)
      if (response.ok) {
        const data = await response.json()
        // Handle both API response formats
        const ncpData = data.data || data
        setNCPs(Array.isArray(ncpData) ? ncpData : [])
        setFilteredNCPs(Array.isArray(ncpData) ? ncpData : [])
      } else {
        console.error("Failed to fetch NCPs")
      }
    } catch (error) {
      console.error("Error fetching NCPs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterNCPs = () => {
    let filtered = Array.isArray(ncps) ? [...ncps] : []

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((ncp) =>
        ncp.ncp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ncp.sku_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ncp.machine_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((ncp) => ncp.status === selectedStatus)
    }

    setFilteredNCPs(filtered)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending QA Review",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
          step: 1,
        }
      case "qa_approved":
        return {
          label: "Assigned to Team Leader",
          color: "bg-blue-100 text-blue-800",
          icon: User,
          step: 2,
        }
      case "tl_processed":
        return {
          label: "Processing Complete",
          color: "bg-purple-100 text-purple-800",
          icon: CheckCircle,
          step: 3,
        }
      case "process_approved":
        return {
          label: "Process Lead Approved",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
          step: 4,
        }
      case "manager_approved":
        return {
          label: "Manager Approved - Completed",
          color: "bg-emerald-100 text-emerald-800",
          icon: CheckCircle,
          step: 5,
        }
      case "rejected":
        return {
          label: "Rejected",
          color: "bg-red-100 text-red-800",
          icon: AlertCircle,
          step: 0,
        }
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800",
          icon: Clock,
          step: 0,
        }
    }
  }

  const getFlowSteps = (ncp: any) => {
    const steps = [
      {
        title: "Submitted",
        status: "completed",
        date: ncp.submitted_at,
        user: ncp.submitted_by,
      },
      {
        title: "QA Review",
        status: ncp.qa_approved_at ? "completed" : ncp.status === "pending" ? "current" : "pending",
        date: ncp.qa_approved_at,
        user: ncp.qa_approved_by,
      },
      {
        title: "Team Leader Processing",
        status: ncp.tl_processed_at ? "completed" : ncp.status === "qa_approved" ? "current" : "pending",
        date: ncp.tl_processed_at,
        user: ncp.assigned_team_leader,
      },
      {
        title: "Process Lead Review",
        status: ncp.process_approved_at ? "completed" : ncp.status === "tl_processed" ? "current" : "pending",
        date: ncp.process_approved_at,
        user: ncp.process_approved_by,
      },
      {
        title: "Final Manager Approval",
        status: ncp.manager_approved_at ? "completed" : ncp.status === "process_approved" ? "current" : "pending",
        date: ncp.manager_approved_at,
        user: ncp.manager_approved_by,
      },
    ]

    return steps
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return formatSubmissionDate(dateString)
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading NCP flow tracker...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">NCP Flow Tracker</h1>
              <p className="text-gray-600 mt-1">Track the progress of all Non-Conformance Product reports</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {(filteredNCPs || []).length} NCPs
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by NCP ID, SKU, or Machine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending QA Review</option>
            <option value="qa_approved">Assigned to Team Leader</option>
            <option value="tl_processed">Processing Complete</option>
            <option value="process_approved">Process Lead Approved</option>
            <option value="manager_approved">Manager Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* NCP Cards */}
        {(filteredNCPs || []).length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No NCPs Found</h3>
              <p className="text-gray-600">No NCP reports match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {(filteredNCPs || []).map((ncp) => {
              const statusInfo = getStatusInfo(ncp.status)
              const StatusIcon = statusInfo.icon
              const flowSteps = getFlowSteps(ncp)

              return (
                <Card key={ncp.id} className="bg-white/90 backdrop-blur-md border-0 shadow-xl ring-1 ring-gray-200/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                          {ncp.ncp_id}
                        </Badge>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        Submitted: {formatSubmissionDate(ncp.submitted_at)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50/50 rounded-lg">
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
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Date</div>
                          <div className="font-medium">
                            {new Date(ncp.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
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

                    {/* Flow Timeline */}
                    <div className="p-4 bg-blue-50/30 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-4">Process Flow</h4>
                      <div className="flex items-center justify-between">
                        {flowSteps.map((step, index) => (
                          <div key={index} className="flex flex-col items-center relative">
                            {index < flowSteps.length - 1 && (
                              <div className="absolute top-4 left-8 w-16 h-0.5 bg-gray-300 z-0" />
                            )}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 ${
                                step.status === "completed"
                                  ? "bg-green-500 text-white"
                                  : step.status === "current"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-300 text-gray-600"
                              }`}
                            >
                              {step.status === "completed" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : step.status === "current" ? (
                                <Clock className="h-4 w-4" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="text-xs text-center mt-2 max-w-20">
                              <div className="font-medium">{step.title}</div>
                              {step.date && <div className="text-gray-500">{formatDate(step.date)}</div>}
                              {step.user && <div className="text-gray-600">{step.user}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Problem Description */}
                    <div className="p-4 bg-orange-50/50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">Problem Description:</div>
                      <p className="text-gray-800 text-sm">{ncp.problem_description}</p>
                    </div>

                    {/* Photo Attachment */}
                    {ncp.photo_attachment && (
                      <div className="p-4 bg-purple-50/50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Photo Attachment:
                        </div>
                        <p className="text-gray-600 text-sm">{ncp.photo_attachment.split("/").pop()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
