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
import { formatToWIB } from "@/lib/date-utils"

export default function WorkflowInterventionPage() {
  const [ncpReports, setNcpReports] = useState([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false)
  const [reassignData, setReassignData] = useState({ ncpId: null, newAssignee: "", role: "qa_leader" })
  const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false)
  const [revertData, setRevertData] = useState({ ncpId: null, newStatus: "" })
  const [users, setUsers] = useState([])

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

  const handleEditReport = async (reportId, updatedData) => {
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

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800",
      qa_approved: "bg-blue-100 text-blue-800",
      tl_processed: "bg-indigo-100 text-indigo-800",
      process_approved: "bg-purple-100 text-purple-800",
      manager_approved: "bg-green-100 text-green-800",
      qa_rejected: "bg-red-100 text-red-800",
      process_rejected: "bg-red-100 text-red-800"
    }
    
    const statusLabels = {
      pending: "Pending",
      qa_approved: "QA Approved",
      tl_processed: "TL Processed",
      process_approved: "Process Approved",
      manager_approved: "Manager Approved",
      qa_rejected: "QA Rejected",
      process_rejected: "Process Rejected"
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusMap[status] || "bg-gray-100 text-gray-800"}`}>
        {statusLabels[status] || status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">Workflow Intervention</CardTitle>
            <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
          </CardHeader>
          <CardContent>
            {/* NCP Reports Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NCP ID</TableHead>
                    <TableHead>SKU Code</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>QA Leader</TableHead>
                    <TableHead>Team Leader</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ncpReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.ncp_id}</TableCell>
                      <TableCell>{report.sku_code}</TableCell>
                      <TableCell>{report.machine_code}</TableCell>
                      <TableCell>{report.submitted_by}</TableCell>
                      <TableCell>{report.qa_leader || "-"}</TableCell>
                      <TableCell>{report.assigned_team_leader || "-"}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{formatToWIB(report.submitted_at)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Dialog open={isEditDialogOpen && editingReport?.id === report.id} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingReport(report)}
                              >
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Edit NCP Report</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="ncpId">NCP ID</Label>
                                    <Input id="ncpId" value={editingReport?.ncp_id || ""} disabled />
                                  </div>
                                  <div>
                                    <Label htmlFor="skuCode">SKU Code</Label>
                                    <Input 
                                      id="skuCode" 
                                      value={editingReport?.sku_code || ""} 
                                      onChange={(e) => setEditingReport({...editingReport, sku_code: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="machineCode">Machine Code</Label>
                                    <Input 
                                      id="machineCode" 
                                      value={editingReport?.machine_code || ""} 
                                      onChange={(e) => setEditingReport({...editingReport, machine_code: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="date">Date</Label>
                                    <Input 
                                      id="date" 
                                      type="date"
                                      value={editingReport?.date || ""} 
                                      onChange={(e) => setEditingReport({...editingReport, date: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="timeIncident">Time Incident</Label>
                                    <Input 
                                      id="timeIncident" 
                                      type="time"
                                      value={editingReport?.time_incident || ""} 
                                      onChange={(e) => setEditingReport({...editingReport, time_incident: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="holdQuantity">Hold Quantity</Label>
                                    <Input 
                                      id="holdQuantity" 
                                      type="number"
                                      value={editingReport?.hold_quantity || ""} 
                                      onChange={(e) => setEditingReport({...editingReport, hold_quantity: parseInt(e.target.value) || 0})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="holdQuantityUOM">Hold Quantity UOM</Label>
                                    <Input 
                                      id="holdQuantityUOM" 
                                      value={editingReport?.hold_quantity_uom || ""} 
                                      onChange={(e) => setEditingReport({...editingReport, hold_quantity_uom: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="qaLeader">QA Leader</Label>
                                    <Select 
                                      value={editingReport?.qa_leader || ""} 
                                      onValueChange={(value) => setEditingReport({...editingReport, qa_leader: value})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select QA Leader" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {users.filter(user => user.role === "qa_leader").map(user => (
                                          <SelectItem key={user.id} value={user.username}>
                                            {user.full_name || user.username}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="assignedTeamLeader">Assigned Team Leader</Label>
                                    <Select 
                                      value={editingReport?.assigned_team_leader || ""} 
                                      onValueChange={(value) => setEditingReport({...editingReport, assigned_team_leader: value})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select Team Leader" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {users.filter(user => user.role === "team_leader").map(user => (
                                          <SelectItem key={user.id} value={user.username}>
                                            {user.full_name || user.username}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="problemDescription">Problem Description</Label>
                                  <Textarea 
                                    id="problemDescription" 
                                    value={editingReport?.problem_description || ""} 
                                    onChange={(e) => setEditingReport({...editingReport, problem_description: e.target.value})}
                                    rows={4}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => handleEditReport(editingReport.id, editingReport)}
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
                              >
                                Reassign
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reassign NCP Report</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="ncpId">NCP ID</Label>
                                  <Input id="ncpId" value={report.ncp_id} disabled />
                                </div>
                                <div>
                                  <Label htmlFor="role">Role to Reassign</Label>
                                  <Select 
                                    value={reassignData.role} 
                                    onValueChange={(value) => setReassignData({...reassignData, role: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="qa_leader">QA Leader</SelectItem>
                                      <SelectItem value="team_leader">Team Leader</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="newAssignee">New Assignee</Label>
                                  <Select 
                                    value={reassignData.newAssignee} 
                                    onValueChange={(value) => setReassignData({...reassignData, newAssignee: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select assignee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {users
                                        .filter(user => 
                                          reassignData.role === "qa_leader" ? user.role === "qa_leader" : user.role === "team_leader"
                                        )
                                        .map(user => (
                                          <SelectItem key={user.id} value={user.username}>
                                            {user.full_name || user.username}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setIsReassignDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={handleReassignReport}
                                    disabled={!reassignData.newAssignee}
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
                              >
                                Revert Status
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Revert NCP Report Status</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="ncpId">NCP ID</Label>
                                  <Input id="ncpId" value={report.ncp_id} disabled />
                                </div>
                                <div>
                                  <Label htmlFor="newStatus">New Status</Label>
                                  <Select 
                                    value={revertData.newStatus} 
                                    onValueChange={(value) => setRevertData({...revertData, newStatus: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="qa_approved">QA Approved</SelectItem>
                                      <SelectItem value="tl_processed">TL Processed</SelectItem>
                                      <SelectItem value="process_approved">Process Approved</SelectItem>
                                      <SelectItem value="manager_approved">Manager Approved</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setIsRevertDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={handleRevertStatus}
                                    disabled={!revertData.newStatus}
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
    </div>
  )
}