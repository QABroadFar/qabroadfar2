"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatSubmissionDate } from "@/lib/date-utils"
import {
  Search,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Package,
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
  qa_approved_at: string | null
  tl_processed_at: string | null
  process_approved_at: string | null
  manager_approved_at: string | null
}

export function NCPFlowTracker({ userInfo }: NCPFlowTrackerProps) {
  const [ncps, setNCPs] = useState<NCPReport[]>([])
  const [filteredNCPs, setFilteredNCPs] = useState<NCPReport[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAllNCPs()
  }, [])

  useEffect(() => {
    filterNCPs()
  }, [searchTerm, ncps])

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

    setFilteredNCPs(filtered)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color: "status-badge-pending",
          icon: Clock,
        }
      case "qa_approved":
        return {
          label: "QA Approved",
          color: "status-badge-qa-approved",
          icon: User,
        }
      case "tl_processed":
        return {
          label: "TL Processed",
          color: "status-badge-tl-processed",
          icon: Package,
        }
      case "process_approved":
        return {
          label: "Process Approved",
          color: "status-badge-process-approved",
          icon: CheckCircle,
        }
      case "manager_approved":
        return {
          label: "Completed",
          color: "status-badge-manager-approved",
          icon: CheckCircle,
        }
      case "rejected":
        return {
          label: "Rejected",
          color: "status-badge-rejected",
          icon: AlertCircle,
        }
      default:
        return {
          label: status,
          color: "bg-gray-500/20 text-gray-300 border border-gray-500/30",
          icon: Clock,
        }
    }
  }

  const getFlowSteps = (ncp: any) => {
    const steps = [
      {
        title: "Submitted",
        status: "completed",
        assignee: ncp.submitted_by,
      },
      {
        title: "QA Review",
        status: ncp.qa_approved_at ? "completed" : ncp.status === "pending" ? "current" : "pending",
        assignee: ncp.qa_leader || "Not assigned",
      },
      {
        title: "Team Leader",
        status: ncp.tl_processed_at ? "completed" : ncp.status === "qa_approved" ? "current" : "pending",
        assignee: ncp.assigned_team_leader || "Not assigned",
      },
      {
        title: "Process Lead",
        status: ncp.process_approved_at ? "completed" : ncp.status === "tl_processed" ? "current" : "pending",
        assignee: "Process Lead",
      },
      {
        title: "Manager",
        status: ncp.manager_approved_at ? "completed" : ncp.status === "process_approved" ? "current" : "pending",
        assignee: "Manager",
      },
    ]

    return steps
  }

  if (isLoading) {
    return (
      <div className="p-6 gradient-bg min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-2 text-blue-200">Loading NCP flow tracker...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 gradient-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold futuristic-heading">NCP Flow Tracker</h1>
              <p className="text-blue-200 mt-1">Track NCP progress through workflow stages</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2 glass-panel">
              {filteredNCPs.length} NCPs
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
            <input
              placeholder="Search by NCP ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-panel text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl"
            />
          </div>
        </div>

        {/* NCP Flow Cards */}
        {filteredNCPs.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold futuristic-heading mb-2">No NCPs Found</h3>
              <p className="text-blue-200">Adjust your search to find NCP reports.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredNCPs.map((ncp) => {
              const statusInfo = getStatusInfo(ncp.status)
              const StatusIcon = statusInfo.icon
              const flowSteps = getFlowSteps(ncp)

              return (
                <Card key={ncp.id} className="glass-card hover:border-blue-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      {/* NCP ID and Status */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-xl px-4 py-2 glass-panel text-white">
                            {ncp.ncp_id}
                          </Badge>
                          <Badge className={`${statusInfo.color} flex items-center gap-1 px-3 py-1`}>
                            <StatusIcon className="h-4 w-4" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Submission Date */}
                      <div className="text-blue-200 text-sm">
                        {formatSubmissionDate(ncp.submitted_at)}
                      </div>
                    </div>

                    {/* Minimal Flow Tracker */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between relative">
                        {/* Progress line */}
                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-blue-900/50 z-0"></div>
                        
                        {flowSteps.map((step, index) => {
                          let statusClass = "bg-blue-900/50"
                          let borderClass = ""
                          if (step.status === "completed") {
                            statusClass = "bg-green-500"
                          } else if (step.status === "current") {
                            statusClass = "bg-blue-500"
                            borderClass = "ring-2 ring-blue-400 ring-opacity-70 animate-pulse"
                          }
                          
                          return (
                            <div key={index} className="flex flex-col items-center relative z-10">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusClass} transition-all duration-300 ${borderClass}`}>
                                {step.status === "completed" ? (
                                  <CheckCircle className="h-4 w-4 text-white" />
                                ) : step.status === "current" ? (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                                )}
                              </div>
                              <div className="text-xs mt-2 text-center max-w-24">
                                <div className={`font-medium ${step.status === "current" ? "text-white" : "text-blue-300"}`}>
                                  {step.title}
                                </div>
                                {step.assignee && (
                                  <div className="text-blue-400 truncate text-xs">
                                    {step.assignee}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
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