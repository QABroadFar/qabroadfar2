"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatToWIB, formatDateOnlyWIB, formatSubmissionDate } from "@/lib/date-utils"
import { Eye } from "lucide-react"
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

export function DatabaseNCP({ userInfo }: DatabaseNCPProps) {
  const [ncps, setNCPs] = useState<NCPReport[]>([])
  const [filteredNCPs, setFilteredNCPs] = useState<NCPReport[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedNCP, setSelectedNCP] = useState<NCPReport | null>(null)
  const [editableNCP, setEditableNCP] = useState<NCPReport | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showRevertDialog, setShowRevertDialog] = useState(false)
  const [showReassignDialog, setShowReassignDialog] = useState(false)
  const [revertStatus, setRevertStatus] = useState("")
  const [reassignRole, setReassignRole] = useState("team_leader")
  const [reassignAssignee, setReassignAssignee] = useState("")
  const [allTeamLeaders, setAllTeamLeaders] = useState<{id: number, username: string, full_name?: string}[]>([])
  const [allQALeaders, setAllQALeaders] = useState<{id: number, username: string, full_name?: string}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("submitted_at")
  const [sortOrder, setSortOrder] = useState("desc")

  useEffect(() => {
    fetchAllNCPs()
    const fetchUsersByRole = async (role: string) => {
      try {
        // Only fetch users by role if user is super_admin or admin
        if (userInfo.role !== "super_admin" && userInfo.role !== "admin") {
          return
        }
        
        const response = await fetch(`/api/users/by-role?role=${role}`)
        if (response.ok) {
          const data = await response.json()
          if (role === "qa_leader") {
            setAllQALeaders(data)
          } else if (role === "team_leader") {
            setAllTeamLeaders(data)
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${role}s`, error)
      }
    }

    // Only fetch users if not public user
    if (userInfo.role !== "public") {
      fetchUsersByRole("qa_leader")
      fetchUsersByRole("team_leader")
    }
  }, [])

  useEffect(() => {
    filterAndSortNCPs()
  }, [searchTerm, selectedStatus, ncps, sortBy, sortOrder])

  const fetchAllNCPs = async () => {
    try {
      setIsLoading(true)
      
      // Determine which API to call based on user role
      let apiUrl = "/api/dashboard/ncps"
      if (userInfo.role === "super_admin") {
        apiUrl = "/api/ncp/list"
      } else if (userInfo.role === "public") {
        apiUrl = "/api/public/ncps"
      }
      
      const response = await fetch(apiUrl)
      if (response.ok) {
        const data = await response.json()
        // Handle both API response formats
        const ncpData = data.data || data
        setNCPs(Array.isArray(ncpData) ? ncpData : [])
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
    let filtered = Array.isArray(ncps) ? [...ncps] : []

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((ncp) =>
        ncp.ncp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ncp.sku_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ncp.machine_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ncp.submitted_by.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((ncp) => ncp.status === selectedStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof NCPReport]
      let bValue: any = b[sortBy as keyof NCPReport]

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
        return <Badge className="status-badge-pending">Pending QA Review</Badge>
      case "qa_approved":
        return <Badge className="status-badge-qa-approved">Team Leader Assigned</Badge>
      case "tl_processed":
        return <Badge className="status-badge-tl-processed">Processing Complete</Badge>
      case "process_approved":
        return <Badge className="status-badge-process-approved">Process Approved</Badge>
      case "manager_approved":
        return <Badge className="status-badge-manager-approved">Completed</Badge>
      case "rejected":
        return <Badge className="status-badge-rejected">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleViewDetails = (ncp: any) => {
    setSelectedNCP(ncp)
    setEditableNCP({ ...ncp })
    setShowDetailDialog(true)
    setIsEditing(false)
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
      ].join(",")) as string[]
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditableNCP((prev) => prev ? { ...prev, [name]: value } : null)
  }

  const handleSaveChanges = async () => {
    if (!editableNCP) return
    try {
      const response = await fetch(`/api/ncp/details/${editableNCP.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editableNCP),
      })
      if (response.ok) {
        fetchAllNCPs()
        setIsEditing(false)
        setShowDetailDialog(false)
      } else {
        console.error("Failed to save changes")
      }
    } catch (error) {
      console.error("Error saving changes:", error)
    }
  }

  const handleRevertStatus = async () => {
    if (!selectedNCP || !revertStatus) return
    try {
      const response = await fetch(`/api/ncp/${selectedNCP.id}/revert-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: revertStatus }),
      })
      if (response.ok) {
        fetchAllNCPs()
        setShowRevertDialog(false)
        setShowDetailDialog(false)
      } else {
        console.error("Failed to revert status")
      }
    } catch (error) {
      console.error("Error reverting status:", error)
    }
  }

  const handleReassign = async () => {
    if (!selectedNCP || !reassignAssignee) return
    try {
      const response = await fetch(`/api/ncp/${selectedNCP.id}/reassign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignee: reassignAssignee, role: reassignRole }),
      })
      if (response.ok) {
        fetchAllNCPs()
        setShowReassignDialog(false)
        setShowDetailDialog(false)
      } else {
        console.error("Failed to reassign NCP")
      }
    } catch (error) {
      console.error("Error reassigning NCP:", error)
    }
  }

  const handleDeleteNCP = async (id: number) => {
    try {
      const response = await fetch(`/api/ncp/details/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchAllNCPs()
        setShowDetailDialog(false)
        alert("NCP report deleted successfully")
      } else {
        const result = await response.json()
        console.error("Failed to delete NCP:", result.error)
        alert(result.error || "Failed to delete NCP report")
      }
    } catch (error) {
      console.error("Error deleting NCP:", error)
      alert("Error deleting NCP report")
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 gradient-bg min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-2 text-blue-200">Loading NCP database...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 gradient-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold futuristic-heading">NCP Database</h1>
              <p className="text-blue-200 mt-1">Minimal database interface</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={exportToExcel} variant="outline" className="glass-panel text-blue-200 hover:bg-blue-500/30">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Badge variant="secondary" className="text-lg px-4 py-2 glass-panel">
                {filteredNCPs.length} NCPs
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
                <Input
                  placeholder="Search by NCP ID, SKU, Machine, or Submitter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-panel text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 glass-panel text-white focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-2 glass-panel text-white focus:ring-2 focus:ring-blue-500"
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
        <Card className="glass-card">
          <CardContent className="p-0">
            {filteredNCPs.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold futuristic-heading mb-2">No Records Found</h3>
                <p className="text-blue-200">No NCP records match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="glass-header">
                      <TableHead className="text-blue-200">NCP ID</TableHead>
                      <TableHead className="text-blue-200">SKU Code</TableHead>
                      <TableHead className="text-blue-200">Machine</TableHead>
                      <TableHead className="text-blue-200">Date</TableHead>
                      <TableHead className="text-blue-200">Status</TableHead>
                      <TableHead className="text-blue-200">Hold Qty</TableHead>
                      <TableHead className="text-blue-200">Submitted By</TableHead>
                      <TableHead className="text-blue-200">Submitted At</TableHead>
                      <TableHead className="text-blue-200">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNCPs.map((ncp: any) => (
                      <TableRow key={ncp.id} className="glass-panel hover:bg-blue-500/10">
                        <TableCell className="font-mono font-medium text-white">{ncp.ncp_id}</TableCell>
                        <TableCell className="text-blue-100">{ncp.sku_code}</TableCell>
                        <TableCell className="text-blue-100">{ncp.machine_code}</TableCell>
                        <TableCell className="text-blue-100">{formatDateOnlyWIB(ncp.date)}</TableCell>
                        <TableCell>{getStatusBadge(ncp.status)}</TableCell>
                        <TableCell className="text-blue-100">
                          {ncp.hold_quantity} {ncp.hold_quantity_uom}
                        </TableCell>
                        <TableCell className="text-blue-100">{ncp.submitted_by}</TableCell>
                        <TableCell className="text-blue-100">{formatSubmissionDate(ncp.submitted_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(ncp)}
                            className="flex items-center gap-1 glass-panel text-blue-200 hover:bg-blue-500/30"
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
          <DialogHeader>
            <div className="flex justify-between items-center">
                <div>
                  <DialogTitle className="text-2xl font-bold futuristic-heading">
                    NCP Details: {selectedNCP?.ncp_id}
                  </DialogTitle>
                  <DialogDescription className="text-blue-200">
                    Complete information for Non-Conformance Product report
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  {userInfo.role === 'super_admin' && !isEditing && (
                    <>
                      <Button onClick={() => setShowRevertDialog(true)} variant="outline" className="glass-panel text-blue-200 hover:bg-blue-500/30">Revert Status</Button>
                      <Button onClick={() => setShowReassignDialog(true)} variant="outline" className="glass-panel text-blue-200 hover:bg-blue-500/30">Reassign</Button>
                      <Button onClick={() => setIsEditing(true)} className="glass-panel">Edit</Button>
                      <Button 
                        onClick={() => {
                          if (confirm("Are you sure you want to permanently delete this NCP report? This action cannot be undone.")) {
                            handleDeleteNCP(selectedNCP!.id)
                          }
                        }} 
                        variant="destructive"
                        className="glass-panel"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                  {isEditing && userInfo.role !== 'public' && (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveChanges} className="glass-panel">Save</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="glass-panel text-blue-200 hover:bg-blue-500/30">Cancel</Button>
                    </div>
                  )}
                </div>
              </div>
          </DialogHeader>

          {selectedNCP && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="glass-panel p-6 rounded-lg">
                <h3 className="text-lg font-semibold futuristic-heading mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-blue-300">NCP ID</label>
                    <p className="text-white font-mono font-bold">{selectedNCP.ncp_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-300">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedNCP.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-300">SKU Code</label>
                    {isEditing ? (
                      <Input
                        name="sku_code"
                        value={editableNCP?.sku_code || ""}
                        onChange={handleInputChange}
                        className="glass-panel text-white"
                      />
                    ) : (
                      <p className="text-white font-medium">{selectedNCP.sku_code}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-300">Machine Code</label>
                    {isEditing ? (
                      <Input
                        name="machine_code"
                        value={editableNCP?.machine_code || ""}
                        onChange={handleInputChange}
                        className="glass-panel text-white"
                      />
                    ) : (
                      <p className="text-white font-medium">{selectedNCP.machine_code}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-300">Incident Date</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        name="date"
                        value={editableNCP?.date ? new Date(editableNCP.date).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="glass-panel text-white"
                      />
                    ) : (
                      <p className="text-white font-medium">
                        {new Date(selectedNCP.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-300">Incident Time</label>
                    {isEditing ? (
                      <Input
                        type="time"
                        name="time_incident"
                        value={editableNCP?.time_incident || ""}
                        onChange={handleInputChange}
                        className="glass-panel text-white"
                      />
                    ) : (
                      <p className="text-white font-medium">{selectedNCP.time_incident}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-300">Hold Quantity</label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          name="hold_quantity"
                          value={editableNCP?.hold_quantity || ""}
                          onChange={handleInputChange}
                          className="glass-panel text-white"
                        />
                        <Input
                          name="hold_quantity_uom"
                          value={editableNCP?.hold_quantity_uom || ""}
                          onChange={handleInputChange}
                          className="glass-panel text-white"
                        />
                      </div>
                    ) : (
                      <p className="text-white font-medium">
                        {selectedNCP.hold_quantity} {selectedNCP.hold_quantity_uom}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-300">Submitted By</label>
                    <p className="text-white font-medium">{selectedNCP.submitted_by}</p>
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              <div className="glass-panel p-6 rounded-lg">
                <h3 className="text-lg font-semibold futuristic-heading mb-4">Problem Description</h3>
                <div className="glass-card p-4 rounded border">
                  {isEditing ? (
                    <Textarea
                      name="problem_description"
                      value={editableNCP?.problem_description || ""}
                      onChange={handleInputChange}
                      rows={5}
                      className="glass-panel text-white"
                    />
                  ) : (
                    <p className="text-white whitespace-pre-wrap">{selectedNCP.problem_description}</p>
                  )}
                </div>
              </div>

              {/* Photo Attachment - Simplified for database view */}
              {selectedNCP.photo_attachment && (
                <div className="glass-panel p-6 rounded-lg">
                  <h3 className="text-lg font-semibold futuristic-heading mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Photo Attachment
                  </h3>
                  <div className="space-y-3">
                    <p className="text-blue-200 text-sm">{selectedNCP.photo_attachment}</p>
                    <div className="relative w-full max-w-md h-64 glass-card rounded-lg overflow-hidden border">
                      <img
                        src={`/api/ncp/image?filename=${selectedNCP.photo_attachment}`}
                        alt="NCP Photo Attachment"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Image+Not+Found"
                        }}
                      />
                    </div>
                    <a 
                      href={`/api/ncp/image?filename=${selectedNCP.photo_attachment}`} 
                      download={selectedNCP.photo_attachment}
                      className="inline-flex items-center gap-2 px-4 py-2 glass-panel text-white rounded-md hover:bg-blue-500/30 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download Image
                    </a>
                  </div>
                </div>
              )}

              {/* QA Information */}
              {selectedNCP.qa_approved_by && (
                <div className="glass-panel p-6 rounded-lg">
                  <h3 className="text-lg font-semibold futuristic-heading mb-4">QA Leader Approval</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-blue-300">Approved By</label>
                      <p className="text-white font-medium">{selectedNCP.qa_approved_by}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-300">Approved At</label>
                      <p className="text-white font-medium">{selectedNCP.qa_approved_at ? formatSubmissionDate(selectedNCP.qa_approved_at) : ""}</p>
                    </div>
                    {selectedNCP.assigned_team_leader && (
                      <div>
                        <label className="text-sm font-medium text-blue-300">Assigned Team Leader</label>
                        <p className="text-white font-medium">{selectedNCP.assigned_team_leader}</p>
                      </div>
                    )}
                  </div>
                  {selectedNCP.disposisi && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-blue-300">Disposition</label>
                      <div className="glass-card p-4 rounded border mt-2">
                        <p className="text-white">{selectedNCP.disposisi}</p>
                      </div>
                      {(selectedNCP.jumlah_sortir || selectedNCP.jumlah_release || selectedNCP.jumlah_reject) && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="glass-card p-3 rounded border text-center">
                            <div className="text-xs text-blue-300">Sortir</div>
                            <div className="text-lg font-bold text-orange-400">{selectedNCP.jumlah_sortir || "0"}</div>
                          </div>
                          <div className="glass-card p-3 rounded border text-center">
                            <div className="text-xs text-blue-300">Release</div>
                            <div className="text-lg font-bold text-green-400">{selectedNCP.jumlah_release || "0"}</div>
                          </div>
                          <div className="glass-card p-3 rounded border text-center">
                            <div className="text-xs text-blue-300">Reject</div>
                            <div className="text-lg font-bold text-red-400">{selectedNCP.jumlah_reject || "0"}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Processing Information */}
              {selectedNCP.tl_processed_at && (
                <div className="glass-panel p-6 rounded-lg">
                  <h3 className="text-lg font-semibold futuristic-heading mb-4">Team Leader Processing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-blue-300">Processed By</label>
                      <p className="text-white font-medium">{selectedNCP.assigned_team_leader}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-300">Processed At</label>
                      <p className="text-white font-medium">{selectedNCP.tl_processed_at ? formatSubmissionDate(selectedNCP.tl_processed_at) : ""}</p>
                    </div>
                  </div>
                  {(isEditing || selectedNCP.root_cause_analysis) && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-blue-300">Root Cause Analysis</label>
                        <div className="glass-card p-4 rounded border mt-2">
                          {isEditing ? (
                            <Textarea
                              name="root_cause_analysis"
                              value={editableNCP?.root_cause_analysis || ""}
                              onChange={handleInputChange}
                              rows={3}
                              className="glass-panel text-white"
                            />
                          ) : (
                            <p className="text-white whitespace-pre-wrap">{selectedNCP.root_cause_analysis}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-blue-300">Corrective Action</label>
                        <div className="glass-card p-4 rounded border mt-2">
                          {isEditing ? (
                            <Textarea
                              name="corrective_action"
                              value={editableNCP?.corrective_action || ""}
                              onChange={handleInputChange}
                              rows={3}
                              className="glass-panel text-white"
                            />
                          ) : (
                            <p className="text-white whitespace-pre-wrap">{selectedNCP.corrective_action}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-blue-300">Preventive Action</label>
                        <div className="glass-card p-4 rounded border mt-2">
                          {isEditing ? (
                            <Textarea
                              name="preventive_action"
                              value={editableNCP?.preventive_action || ""}
                              onChange={handleInputChange}
                              rows={3}
                              className="glass-panel text-white"
                            />
                          ) : (
                            <p className="text-white whitespace-pre-wrap">{selectedNCP.preventive_action}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Final Approvals */}
              {selectedNCP.process_approved_by && (
                <div className="glass-panel p-6 rounded-lg">
                  <h3 className="text-lg font-semibold futuristic-heading mb-4">Process Lead Approval</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-blue-300">Approved By</label>
                      <p className="text-white font-medium">{selectedNCP.process_approved_by}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-300">Approved At</label>
                      <p className="text-white font-medium">{selectedNCP.process_approved_at ? formatSubmissionDate(selectedNCP.process_approved_at) : ""}</p>
                    </div>
                  </div>
                  {selectedNCP.process_comment && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-blue-300">Comment</label>
                      <div className="glass-card p-4 rounded border mt-2">
                        <p className="text-white">{selectedNCP.process_comment}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedNCP.manager_approved_by && (
                <div className="glass-panel p-6 rounded-lg">
                  <h3 className="text-lg font-semibold futuristic-heading mb-4">Manager Final Approval</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-blue-300">Approved By</label>
                      <p className="text-white font-medium">{selectedNCP.manager_approved_by}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-300">Approved At</label>
                      <p className="text-white font-medium">{selectedNCP.manager_approved_at ? formatSubmissionDate(selectedNCP.manager_approved_at) : ""}</p>
                    </div>
                  </div>
                  {selectedNCP.manager_comment && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-blue-300">Final Comment</label>
                      <div className="glass-card p-4 rounded border mt-2">
                        <p className="text-white">{selectedNCP.manager_comment}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revert Status Dialog */}
      <Dialog open={showRevertDialog} onOpenChange={setShowRevertDialog}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="futuristic-heading">Revert NCP Status</DialogTitle>
            <DialogDescription className="text-blue-200">
              Select a new status to revert the NCP report to. This action will be logged.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <select
              value={revertStatus}
              onChange={(e) => setRevertStatus(e.target.value)}
              className="w-full px-3 py-2 glass-panel text-white"
            >
              <option value="">Select a status</option>
              <option value="pending">Pending QA Review</option>
              <option value="qa_approved">Team Leader Assigned</option>
              <option value="tl_processed">Processing Complete</option>
              <option value="process_approved">Process Approved</option>
            </select>
          </div>
          <Button onClick={handleRevertStatus} className="glass-panel">Confirm Revert</Button>
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="futuristic-heading">Reassign NCP</DialogTitle>
            <DialogDescription className="text-blue-200">
              Select a new assignee for this NCP report. This action will be logged.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <select
              value={reassignRole}
              onChange={(e) => setReassignRole(e.target.value)}
              className="w-full px-3 py-2 glass-panel text-white"
            >
              <option value="team_leader">Team Leader</option>
              <option value="qa_leader">QA Leader</option>
            </select>
            <select
              value={reassignAssignee}
              onChange={(e) => setReassignAssignee(e.target.value)}
              className="w-full px-3 py-2 glass-panel text-white"
            >
              <option value="">Select an assignee</option>
              {(reassignRole === 'team_leader' ? allTeamLeaders : allQALeaders).map(user => (
                <option key={user.id} value={user.username}>{user.full_name || user.username}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleReassign} className="glass-panel">Confirm Reassignment</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}