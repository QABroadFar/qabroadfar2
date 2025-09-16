"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { formatToWIB, formatSubmissionDate } from "@/lib/date-utils"
import { Edit, User, RotateCcw, FileText } from "lucide-react"

export default function WorkflowInterventionPage() {
  const [ncpReports, setNcpReports] = useState<any[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<any>(null)
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false)
  const [reassignData, setReassignData] = useState({ ncpId: null as number | null, newAssignee: "", role: "qa_leader" })
  const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false)
  const [revertData, setRevertData] = useState({ ncpId: null as number | null, newStatus: "" })
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    fetchNCPReports()
    fetchUsers()
  }, [])

  const fetchNCPReports = async () => {
    try {
      const response = await fetch("/api/ncp/list")
      if (response.ok) {
        const data = await response.json()
        setNcpReports(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch NCP reports",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching NCP reports:", error)
      toast({
        title: "Error",
        description: "Failed to fetch NCP reports",
        variant: "destructive"
      })
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      })
    }
  }

  const handleEditReport = async (reportId: number, updatedData: any) => {
    try {
      const response = await fetch(`/api/ncp/details/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "NCP report updated successfully"
        })
        setIsEditDialogOpen(false)
        fetchNCPReports()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update NCP report",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating NCP report:", error)
      toast({
        title: "Error",
        description: "Failed to update NCP report",
        variant: "destructive"
      })
    }
  }

  const handleReassignReport = async () => {
    try {
      const response = await fetch(`/api/ncp/${reassignData.ncpId}/reassign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          newAssignee: reassignData.newAssignee,
          role: reassignData.role
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "NCP report reassigned successfully"
        })
        setIsReassignDialogOpen(false)
        fetchNCPReports()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to reassign NCP report",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error reassigning NCP report:", error)
      toast({
        title: "Error",
        description: "Failed to reassign NCP report",
        variant: "destructive"
      })
    }
  }

  const handleRevertStatus = async () => {
    try {
      const response = await fetch(`/api/ncp/${revertData.ncpId}/revert-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          newStatus: revertData.newStatus
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "NCP report status reverted successfully"
        })
        setIsRevertDialogOpen(false)
        fetchNCPReports()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to revert NCP report status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error reverting NCP report status:", error)
      toast({
        title: "Error",
        description: "Failed to revert NCP report status",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", className: "status-badge-pending" },
      qa_approved: { label: "QA Approved", className: "status-badge-qa-approved" },
      tl_processed: { label: "TL Processed", className: "status-badge-tl-processed" },
      process_approved: { label: "Process Approved", className: "status-badge-process-approved" },
      manager_approved: { label: "Completed", className: "status-badge-manager-approved" },
      qa_rejected: { label: "QA Rejected", className: "status-badge-rejected" },
      process_rejected: { label: "Process Rejected", className: "status-badge-rejected" },
      manager_rejected: { label: "Manager Rejected", className: "status-badge-rejected" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-100 text-gray-800" }
    return <span className={`px-2 py-1 rounded-full text-xs ${config.className}`}>{config.label}</span>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold futuristic-heading">Workflow Intervention</h1>
          <p className="text-blue-300">Manage and intervene in NCP workflow processes</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 futuristic-subheading">
            <FileText className="h-5 w-5 text-blue-300" />
            NCP Reports Requiring Intervention
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* NCP Reports Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-200">NCP ID</TableHead>
                  <TableHead className="text-blue-200">SKU Code</TableHead>
                  <TableHead className="text-blue-200">Machine</TableHead>
                  <TableHead className="text-blue-200">Submitted By</TableHead>
                  <TableHead className="text-blue-200">QA Leader</TableHead>
                  <TableHead className="text-blue-200">Team Leader</TableHead>
                  <TableHead className="text-blue-200">Status</TableHead>
                  <TableHead className="text-blue-200">Submitted At</TableHead>
                  <TableHead className="text-blue-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ncpReports.map((report) => (
                  <TableRow key={report.id} className="glass-panel">
                    <TableCell className="font-medium text-blue-100">{report.ncp_id}</TableCell>
                    <TableCell className="text-blue-200">{report.sku_code}</TableCell>
                    <TableCell className="text-blue-200">{report.machine_code}</TableCell>
                    <TableCell className="text-blue-200">{report.submitted_by}</TableCell>
                    <TableCell className="text-blue-200">{report.qa_leader || "-"}</TableCell>
                    <TableCell className="text-blue-200">{report.assigned_team_leader || "-"}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-blue-200">{formatSubmissionDate(report.submitted_at)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Dialog open={isEditDialogOpen && editingReport?.id === report.id} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingReport(report)}
                              className="glass-panel text-blue-200 hover:bg-blue-500/30"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-card max-w-3xl">
                            <DialogHeader>
                              <DialogTitle className="futuristic-heading">Edit NCP Report</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="ncpId" className="text-blue-200">NCP ID</Label>
                                  <Input 
                                    id="ncpId" 
                                    value={editingReport?.ncp_id || ""} 
                                    disabled 
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="skuCode" className="text-blue-200">SKU Code</Label>
                                  <Input 
                                    id="skuCode" 
                                    value={editingReport?.sku_code || ""} 
                                    onChange={(e) => setEditingReport({...editingReport, sku_code: e.target.value})}
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="machineCode" className="text-blue-200">Machine Code</Label>
                                  <Input 
                                    id="machineCode" 
                                    value={editingReport?.machine_code || ""} 
                                    onChange={(e) => setEditingReport({...editingReport, machine_code: e.target.value})}
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="date" className="text-blue-200">Date</Label>
                                  <Input 
                                    id="date" 
                                    type="date"
                                    value={editingReport?.date || ""} 
                                    onChange={(e) => setEditingReport({...editingReport, date: e.target.value})}
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="timeIncident" className="text-blue-200">Time Incident</Label>
                                  <Input 
                                    id="timeIncident" 
                                    type="time"
                                    value={editingReport?.time_incident || ""} 
                                    onChange={(e) => setEditingReport({...editingReport, time_incident: e.target.value})}
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="holdQuantity" className="text-blue-200">Hold Quantity</Label>
                                  <Input 
                                    id="holdQuantity" 
                                    type="number"
                                    value={editingReport?.hold_quantity || ""} 
                                    onChange={(e) => setEditingReport({...editingReport, hold_quantity: parseInt(e.target.value) || 0})}
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="holdQuantityUOM" className="text-blue-200">Hold Quantity UOM</Label>
                                  <Input 
                                    id="holdQuantityUOM" 
                                    value={editingReport?.hold_quantity_uom || ""} 
                                    onChange={(e) => setEditingReport({...editingReport, hold_quantity_uom: e.target.value})}
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="qaLeader" className="text-blue-200">QA Leader</Label>
                                  <Select 
                                    value={editingReport?.qa_leader || ""} 
                                    onValueChange={(value) => setEditingReport({...editingReport, qa_leader: value})}
                                  >
                                    <SelectTrigger className="glass-panel">
                                      <SelectValue placeholder="Select QA Leader" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card">
                                      {users.filter(user => user.role === "qa_leader").map(user => (
                                        <SelectItem key={user.id} value={user.username} className="text-blue-200">
                                          {user.full_name || user.username}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="assignedTeamLeader" className="text-blue-200">Assigned Team Leader</Label>
                                  <Select 
                                    value={editingReport?.assigned_team_leader || ""} 
                                    onValueChange={(value) => setEditingReport({...editingReport, assigned_team_leader: value})}
                                  >
                                    <SelectTrigger className="glass-panel">
                                      <SelectValue placeholder="Select Team Leader" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card">
                                      {users.filter(user => user.role === "team_leader").map(user => (
                                        <SelectItem key={user.id} value={user.username} className="text-blue-200">
                                          {user.full_name || user.username}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="problemDescription" className="text-blue-200">Problem Description</Label>
                                <Textarea 
                                  id="problemDescription" 
                                  value={editingReport?.problem_description || ""} 
                                  onChange={(e) => setEditingReport({...editingReport, problem_description: e.target.value})}
                                  rows={4}
                                  className="glass-panel"
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setIsEditDialogOpen(false)}
                                  className="glass-panel text-blue-200 hover:bg-blue-500/30"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={() => handleEditReport(editingReport.id, editingReport)}
                                  className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
                                >
                                  Update Report
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={isReassignDialogOpen && reassignData.ncpId === report.id} onOpenChange={setIsReassignDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setReassignData({ ncpId: report.id, newAssignee: "", role: "qa_leader" })}
                              className="glass-panel text-blue-200 hover:bg-blue-500/30"
                            >
                              <User className="h-4 w-4 mr-1" />
                              Reassign
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-card">
                            <DialogHeader>
                              <DialogTitle className="futuristic-heading">Reassign NCP Report</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="ncpId" className="text-blue-200">NCP ID</Label>
                                <Input 
                                  id="ncpId" 
                                  value={report.ncp_id} 
                                  disabled 
                                  className="glass-panel"
                                />
                              </div>
                              <div>
                                <Label htmlFor="role" className="text-blue-200">Role to Reassign</Label>
                                <Select 
                                  value={reassignData.role} 
                                  onValueChange={(value) => setReassignData({...reassignData, role: value})}
                                >
                                  <SelectTrigger className="glass-panel">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="glass-card">
                                    <SelectItem value="qa_leader" className="text-blue-200">QA Leader</SelectItem>
                                    <SelectItem value="team_leader" className="text-blue-200">Team Leader</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="newAssignee" className="text-blue-200">New Assignee</Label>
                                <Select 
                                  value={reassignData.newAssignee} 
                                  onValueChange={(value) => setReassignData({...reassignData, newAssignee: value})}
                                >
                                  <SelectTrigger className="glass-panel">
                                    <SelectValue placeholder="Select assignee" />
                                  </SelectTrigger>
                                  <SelectContent className="glass-card">
                                    {users
                                      .filter(user => 
                                        reassignData.role === "qa_leader" ? user.role === "qa_leader" : user.role === "team_leader"
                                      )
                                      .map(user => (
                                        <SelectItem key={user.id} value={user.username} className="text-blue-200">
                                          {user.full_name || user.username}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setIsReassignDialogOpen(false)}
                                  className="glass-panel text-blue-200 hover:bg-blue-500/30"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleReassignReport}
                                  disabled={!reassignData.newAssignee}
                                  className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
                                >
                                  Reassign Report
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={isRevertDialogOpen && revertData.ncpId === report.id} onOpenChange={setIsRevertDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setRevertData({ ncpId: report.id, newStatus: "" })}
                              className="glass-panel text-blue-200 hover:bg-blue-500/30"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Revert
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-card">
                            <DialogHeader>
                              <DialogTitle className="futuristic-heading">Revert NCP Report Status</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="ncpId" className="text-blue-200">NCP ID</Label>
                                <Input 
                                  id="ncpId" 
                                  value={report.ncp_id} 
                                  disabled 
                                  className="glass-panel"
                                />
                              </div>
                              <div>
                                <Label htmlFor="newStatus" className="text-blue-200">New Status</Label>
                                <Select 
                                  value={revertData.newStatus} 
                                  onValueChange={(value) => setRevertData({...revertData, newStatus: value})}
                                >
                                  <SelectTrigger className="glass-panel">
                                    <SelectValue placeholder="Select new status" />
                                  </SelectTrigger>
                                  <SelectContent className="glass-card">
                                    <SelectItem value="pending" className="text-blue-200">Pending</SelectItem>
                                    <SelectItem value="qa_approved" className="text-blue-200">QA Approved</SelectItem>
                                    <SelectItem value="tl_processed" className="text-blue-200">TL Processed</SelectItem>
                                    <SelectItem value="process_approved" className="text-blue-200">Process Approved</SelectItem>
                                    <SelectItem value="manager_approved" className="text-blue-200">Manager Approved</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setIsRevertDialogOpen(false)}
                                  className="glass-panel text-blue-200 hover:bg-blue-500/30"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleRevertStatus}
                                  disabled={!revertData.newStatus}
                                  className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
                                >
                                  Revert Status
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}