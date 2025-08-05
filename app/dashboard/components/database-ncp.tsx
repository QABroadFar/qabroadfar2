"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Search,
  Loader2,
  FileText,
  Calendar,
  User,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  ImageIcon,
  Download,
} from "lucide-react"

interface DatabaseNCPProps {
  userInfo: {
    id: number
    username: string
    role: string
  }
}

export function DatabaseNCP({ userInfo }: DatabaseNCPProps) {
  const [ncps, setNCPs] = useState([])
  const [filteredNCPs, setFilteredNCPs] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedNCP, setSelectedNCP] = useState(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("submitted_at")
  const [sortOrder, setSortOrder] = useState("desc")

  useEffect(() => {
    fetchAllNCPs()
  }, [])

  useEffect(() => {
    filterAndSortNCPs()
  }, [searchTerm, selectedStatus, ncps, sortBy, sortOrder])

  const fetchAllNCPs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/ncp/list?type=all")
      if (response.ok) {
        const data = await response.json()
        setNCPs(data.data)
      } else {
        console.error("Failed to fetch NCPs")
      }
    } catch (error) {
      console.error("Error fetching NCPs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortNCPs = () => {
    let filtered = ncps

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((ncp: any) =>
        ncp.ncp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ncp.sku_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ncp.machine_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ncp.submitted_by.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((ncp: any) => ncp.status === selectedStatus)
    }

    // Sort
    filtered.sort((a: any, b: any) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === "submitted_at" || sortBy === "date") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredNCPs(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending QA Review</Badge>
      case "qa_approved":
        return <Badge className="bg-blue-100 text-blue-800">Team Leader Assigned</Badge>
      case "tl_processed":
        return <Badge className="bg-purple-100 text-purple-800">Processing Complete</Badge>
      case "process_approved":
        return <Badge className="bg-green-100 text-green-800">Process Approved</Badge>
      case "manager_approved":
        return <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleViewDetails = (ncp: any) => {
    setSelectedNCP(ncp)
    setShowDetailDialog(true)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportToExcel = () => {
    const headers = [
      "NCP ID", "SKU Code", "Machine Code", "Date", "Time", "Hold Quantity", "UOM",
      "Problem Description", "Status", "Submitted By", "Submitted At", "QA Leader",
      "Disposisi", "Sortir", "Release", "Reject", "Team Leader", "Root Cause",
      "Corrective Action", "Preventive Action"
    ]

    const csvContent = [
      headers.join(","),
      ...filteredNCPs.map((ncp: any) => [
        ncp.ncp_id,
        ncp.sku_code,
        ncp.machine_code,
        ncp.date,
        ncp.time_incident,
        ncp.hold_quantity,
        ncp.hold_quantity_uom,
        `"${ncp.problem_description?.replace(/"/g, '""') || ''}"`,
        ncp.status,
        ncp.submitted_by,
        ncp.submitted_at,
        ncp.qa_leader,
        `"${ncp.disposisi?.replace(/"/g, '""') || ''}"`,
        ncp.jumlah_sortir || '0',
        ncp.jumlah_release || '0',
        ncp.jumlah_reject || '0',
        ncp.assigned_team_leader || '',
        `"${ncp.root_cause_analysis?.replace(/"/g, '""') || ''}"`,
        `"${ncp.corrective_action?.replace(/"/g, '""') || ''}"`,
        `"${ncp.preventive_action?.replace(/"/g, '""') || ''}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ncp-database-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading NCP database...</span>
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
              <h1 className="text-3xl font-bold text-gray-800">NCP Database</h1>
              <p className="text-gray-600 mt-1">Complete database of all Non-Conformance Product reports</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={exportToExcel} variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {filteredNCPs.length} NCPs
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by NCP ID, SKU, Machine, or Submitter..."
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
                <option value="qa_approved">Team Leader Assigned</option>
                <option value="tl_processed">Processing Complete</option>
                <option value="process_approved">Process Approved</option>
                <option value="manager_approved">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-")
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="submitted_at-desc">Newest First</option>
                <option value="submitted_at-asc">Oldest First</option>
                <option value="ncp_id-asc">NCP ID A-Z</option>
                <option value="ncp_id-desc">NCP ID Z-A</option>
                <option value="status-asc">Status A-Z</option>
                <option value="sku_code-asc">SKU A-Z</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* NCP Table */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
          <CardContent className="p-0">
            {filteredNCPs.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Records Found</h3>
                <p className="text-gray-600">No NCP records match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NCP ID</TableHead>
                      <TableHead>SKU Code</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hold Qty</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNCPs.map((ncp: any) => (
                      <TableRow key={ncp.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-mono font-medium">{ncp.ncp_id}</TableCell>
                        <TableCell>{ncp.sku_code}</TableCell>
                        <TableCell>{ncp.machine_code}</TableCell>
                        <TableCell>
                          {new Date(ncp.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{getStatusBadge(ncp.status)}</TableCell>
                        <TableCell>
                          {ncp.hold_quantity} {ncp.hold_quantity_uom}
                        </TableCell>
                        <TableCell>{ncp.submitted_by}</TableCell>
                        <TableCell>{formatDate(ncp.submitted_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(ncp)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              NCP Details: {selectedNCP?.ncp_id}
            </DialogTitle>
            <DialogDescription>
              Complete information for Non-Conformance Product report
            </DialogDescription>
          </DialogHeader>

          {selectedNCP && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="bg-blue-50/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">NCP ID</label>
                    <p className="text-gray-800 font-mono font-bold">{selectedNCP.ncp_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedNCP.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">SKU Code</label>
                    <p className="text-gray-800 font-medium">{selectedNCP.sku_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Machine Code</label>
                    <p className="text-gray-800 font-medium">{selectedNCP.machine_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Incident Date</label>
                    <p className="text-gray-800 font-medium">
                      {new Date(selectedNCP.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Incident Time</label>
                    <p className="text-gray-800 font-medium">{selectedNCP.time_incident}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Hold Quantity</label>
                    <p className="text-gray-800 font-medium">
                      {selectedNCP.hold_quantity} {selectedNCP.hold_quantity_uom}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Submitted By</label>
                    <p className="text-gray-800 font-medium">{selectedNCP.submitted_by}</p>
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              <div className="bg-orange-50/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Problem Description</h3>
                <div className="bg-white p-4 rounded border">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedNCP.problem_description}</p>
                </div>
              </div>

              {/* Photo Attachment - Simplified for database view */}
              {selectedNCP.photo_attachment && (
                <div className="bg-purple-50/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Photo Attachment
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm">{selectedNCP.photo_attachment.split("/").pop()}</p>
                    <p className="text-xs text-gray-500">Photo is not displayed in this view. Click filename to download.</p>
                  </div>
                </div>
              )}

              {/* QA Information */}
              {selectedNCP.qa_approved_by && (
                <div className="bg-green-50/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">QA Leader Approval</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Approved By</label>
                      <p className="text-gray-800 font-medium">{selectedNCP.qa_approved_by}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Approved At</label>
                      <p className="text-gray-800 font-medium">{formatDate(selectedNCP.qa_approved_at)}</p>
                    </div>
                    {selectedNCP.assigned_team_leader && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Assigned Team Leader</label>
                        <p className="text-gray-800 font-medium">{selectedNCP.assigned_team_leader}</p>
                      </div>
                    )}
                  </div>
                  {selectedNCP.disposisi && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-600">Disposition</label>
                      <div className="bg-white p-4 rounded border mt-2">
                        <p className="text-gray-800">{selectedNCP.disposisi}</p>
                      </div>
                      {(selectedNCP.jumlah_sortir || selectedNCP.jumlah_release || selectedNCP.jumlah_reject) && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="bg-white p-3 rounded border text-center">
                            <div className="text-xs text-gray-500">Sortir</div>
                            <div className="text-lg font-bold text-orange-600">{selectedNCP.jumlah_sortir || "0"}</div>
                          </div>
                          <div className="bg-white p-3 rounded border text-center">
                            <div className="text-xs text-gray-500">Release</div>
                            <div className="text-lg font-bold text-green-600">{selectedNCP.jumlah_release || "0"}</div>
                          </div>
                          <div className="bg-white p-3 rounded border text-center">
                            <div className="text-xs text-gray-500">Reject</div>
                            <div className="text-lg font-bold text-red-600">{selectedNCP.jumlah_reject || "0"}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Processing Information */}
              {selectedNCP.tl_processed_at && (
                <div className="bg-purple-50/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Leader Processing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Processed By</label>
                      <p className="text-gray-800 font-medium">{selectedNCP.assigned_team_leader}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Processed At</label>
                      <p className="text-gray-800 font-medium">{formatDate(selectedNCP.tl_processed_at)}</p>
                    </div>
                  </div>
                  {selectedNCP.root_cause_analysis && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Root Cause Analysis</label>
                        <div className="bg-white p-4 rounded border mt-2">
                          <p className="text-gray-800 whitespace-pre-wrap">{selectedNCP.root_cause_analysis}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Corrective Action</label>
                        <div className="bg-white p-4 rounded border mt-2">
                          <p className="text-gray-800 whitespace-pre-wrap">{selectedNCP.corrective_action}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Preventive Action</label>
                        <div className="bg-white p-4 rounded border mt-2">
                          <p className="text-gray-800 whitespace-pre-wrap">{selectedNCP.preventive_action}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Final Approvals */}
              {selectedNCP.process_approved_by && (
                <div className="bg-green-50/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Process Lead Approval</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Approved By</label>
                      <p className="text-gray-800 font-medium">{selectedNCP.process_approved_by}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Approved At</label>
                      <p className="text-gray-800 font-medium">{formatDate(selectedNCP.process_approved_at)}</p>
                    </div>
                  </div>
                  {selectedNCP.process_comment && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-600">Comment</label>
                      <div className="bg-white p-4 rounded border mt-2">
                        <p className="text-gray-800">{selectedNCP.process_comment}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedNCP.manager_approved_by && (
                <div className="bg-emerald-50/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Manager Final Approval</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Approved By</label>
                      <p className="text-gray-800 font-medium">{selectedNCP.manager_approved_by}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Approved At</label>
                      <p className="text-gray-800 font-medium">{formatDate(selectedNCP.manager_approved_at)}</p>
                    </div>
                  </div>
                  {selectedNCP.final_comment && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-600">Final Comment</label>
                      <div className="bg-white p-4 rounded border mt-2">
                        <p className="text-gray-800">{selectedNCP.final_comment}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}