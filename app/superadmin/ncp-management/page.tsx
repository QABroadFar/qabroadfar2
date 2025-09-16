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
import { FileText, Plus, Edit, Trash2 } from "lucide-react"

export default function NCPManagementPage() {
  const [ncpReports, setNcpReports] = useState<any[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<any>(null)
  const [newReport, setNewReport] = useState({
    skuCode: "",
    machineCode: "",
    date: "",
    timeIncident: "",
    holdQuantity: 0,
    holdQuantityUOM: "",
    problemDescription: "",
    qaLeader: ""
  })
  const [users, setUsers] = useState<any[]>([])
  const [skuCodes, setSkuCodes] = useState<any[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [uoms, setUoms] = useState<any[]>([])

  useEffect(() => {
    fetchNCPReports()
    fetchUsers()
    fetchSKUCodes()
    fetchMachines()
    fetchUOMs()
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

  const fetchSKUCodes = async () => {
    try {
      const response = await fetch("/api/system-settings/sku-codes")
      if (response.ok) {
        const data = await response.json()
        setSkuCodes(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch SKU codes",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching SKU codes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch SKU codes",
        variant: "destructive"
      })
    }
  }

  const fetchMachines = async () => {
    try {
      const response = await fetch("/api/system-settings/machines")
      if (response.ok) {
        const data = await response.json()
        setMachines(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch machines",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching machines:", error)
      toast({
        title: "Error",
        description: "Failed to fetch machines",
        variant: "destructive"
      })
    }
  }

  const fetchUOMs = async () => {
    try {
      const response = await fetch("/api/system-settings/uoms")
      if (response.ok) {
        const data = await response.json()
        setUoms(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch UOMs",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching UOMs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch UOMs",
        variant: "destructive"
      })
    }
  }

  const handleCreateReport = async () => {
    try {
      const response = await fetch("/api/ncp/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          skuCode: newReport.skuCode,
          machineCode: newReport.machineCode,
          date: newReport.date,
          timeIncident: newReport.timeIncident,
          holdQuantity: newReport.holdQuantity,
          holdQuantityUOM: newReport.holdQuantityUOM,
          problemDescription: newReport.problemDescription,
          qaLeader: newReport.qaLeader
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "NCP report created successfully"
        })
        setIsCreateDialogOpen(false)
        setNewReport({
          skuCode: "",
          machineCode: "",
          date: "",
          timeIncident: "",
          holdQuantity: 0,
          holdQuantityUOM: "",
          problemDescription: "",
          qaLeader: ""
        })
        fetchNCPReports()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to create NCP report",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating NCP report:", error)
      toast({
        title: "Error",
        description: "Failed to create NCP report",
        variant: "destructive"
      })
    }
  }

  const handleUpdateReport = async (reportId: number, updatedData: any) => {
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
        setEditingReport(null)
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

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm("Are you sure you want to delete this NCP report? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/ncp/details/${reportId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "NCP report deleted successfully"
        })
        fetchNCPReports()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete NCP report",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting NCP report:", error)
      toast({
        title: "Error",
        description: "Failed to delete NCP report",
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
          <h1 className="text-3xl font-bold futuristic-heading">NCP Report Management</h1>
          <p className="text-blue-300">Manage and oversee all NCP reports in the system</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 futuristic-subheading">
            <FileText className="h-5 w-5 text-blue-300" />
            All NCP Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Create NCP Report Button */}
          <div className="mb-6">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="glass-panel">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New NCP Report
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="futuristic-heading">Create New NCP Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newSkuCode" className="text-blue-200">SKU Code</Label>
                      <Select 
                        value={newReport.skuCode} 
                        onValueChange={(value) => setNewReport({...newReport, skuCode: value})}
                      >
                        <SelectTrigger className="glass-panel">
                          <SelectValue placeholder="Select SKU code" />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          {skuCodes.map(sku => (
                            <SelectItem key={sku.id} value={sku.code} className="text-blue-200">
                              {sku.code} - {sku.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="newMachineCode" className="text-blue-200">Machine Code</Label>
                      <Select 
                        value={newReport.machineCode} 
                        onValueChange={(value) => setNewReport({...newReport, machineCode: value})}
                      >
                        <SelectTrigger className="glass-panel">
                          <SelectValue placeholder="Select machine" />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          {machines.map(machine => (
                            <SelectItem key={machine.id} value={machine.code} className="text-blue-200">
                              {machine.code} - {machine.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="newDate" className="text-blue-200">Date</Label>
                      <Input 
                        id="newDate" 
                        type="date"
                        value={newReport.date} 
                        onChange={(e) => setNewReport({...newReport, date: e.target.value})}
                        className="glass-panel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newTimeIncident" className="text-blue-200">Time Incident</Label>
                      <Input 
                        id="newTimeIncident" 
                        type="time"
                        value={newReport.timeIncident} 
                        onChange={(e) => setNewReport({...newReport, timeIncident: e.target.value})}
                        className="glass-panel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newHoldQuantity" className="text-blue-200">Hold Quantity</Label>
                      <Input 
                        id="newHoldQuantity" 
                        type="number"
                        value={newReport.holdQuantity} 
                        onChange={(e) => setNewReport({...newReport, holdQuantity: parseInt(e.target.value) || 0})}
                        className="glass-panel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newHoldQuantityUOM" className="text-blue-200">Hold Quantity UOM</Label>
                      <Select 
                        value={newReport.holdQuantityUOM} 
                        onValueChange={(value) => setNewReport({...newReport, holdQuantityUOM: value})}
                      >
                        <SelectTrigger className="glass-panel">
                          <SelectValue placeholder="Select UOM" />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          {uoms.map(uom => (
                            <SelectItem key={uom.id} value={uom.code} className="text-blue-200">
                              {uom.code} - {uom.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="newQaLeader" className="text-blue-200">QA Leader</Label>
                      <Select 
                        value={newReport.qaLeader} 
                        onValueChange={(value) => setNewReport({...newReport, qaLeader: value})}
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
                  </div>
                  <div>
                    <Label htmlFor="newProblemDescription" className="text-blue-200">Problem Description</Label>
                    <Textarea 
                      id="newProblemDescription" 
                      value={newReport.problemDescription} 
                      onChange={(e) => setNewReport({...newReport, problemDescription: e.target.value})}
                      rows={4}
                      className="glass-panel"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="glass-panel text-blue-200 hover:bg-blue-500/30"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateReport}
                      disabled={!newReport.skuCode || !newReport.machineCode || !newReport.date || !newReport.timeIncident || !newReport.holdQuantity || !newReport.holdQuantityUOM || !newReport.problemDescription || !newReport.qaLeader}
                      className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
                    >
                      Create Report
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

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
                                  <Label htmlFor="editNcpId" className="text-blue-200">NCP ID</Label>
                                  <Input 
                                    id="editNcpId" 
                                    value={editingReport?.ncp_id || ""} 
                                    disabled 
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editSkuCode" className="text-blue-200">SKU Code</Label>
                                  <Select 
                                    value={editingReport?.sku_code || ""} 
                                    onValueChange={(value) => setEditingReport({...editingReport, sku_code: value})}
                                  >
                                    <SelectTrigger className="glass-panel">
                                      <SelectValue placeholder="Select SKU code" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card">
                                      {skuCodes.map(sku => (
                                        <SelectItem key={sku.id} value={sku.code} className="text-blue-200">
                                          {sku.code} - {sku.description}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="editMachineCode" className="text-blue-200">Machine Code</Label>
                                  <Select 
                                    value={editingReport?.machine_code || ""} 
                                    onValueChange={(value) => setEditingReport({...editingReport, machine_code: value})}
                                  >
                                    <SelectTrigger className="glass-panel">
                                      <SelectValue placeholder="Select machine" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card">
                                      {machines.map(machine => (
                                        <SelectItem key={machine.id} value={machine.code} className="text-blue-200">
                                          {machine.code} - {machine.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="editDate" className="text-blue-200">Date</Label>
                                  <Input 
                                    id="editDate" 
                                    type="date"
                                    value={editingReport?.date || ""} 
                                    onChange={(e) => setEditingReport({...editingReport, date: e.target.value})}
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editTimeIncident" className="text-blue-200">Time Incident</Label>
                                  <Input 
                                    id="editTimeIncident" 
                                    type="time"
                                    value={editingReport?.time_incident || ""} 
                                    onChange={(e) => setEditingReport({...editingReport, time_incident: e.target.value})}
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editHoldQuantity" className="text-blue-200">Hold Quantity</Label>
                                  <Input 
                                    id="editHoldQuantity" 
                                    type="number"
                                    value={editingReport?.hold_quantity || ""} 
                                    onChange={(e) => setEditingReport({...editingReport, hold_quantity: parseInt(e.target.value) || 0})}
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editHoldQuantityUOM" className="text-blue-200">Hold Quantity UOM</Label>
                                  <Select 
                                    value={editingReport?.hold_quantity_uom || ""} 
                                    onValueChange={(value) => setEditingReport({...editingReport, hold_quantity_uom: value})}
                                  >
                                    <SelectTrigger className="glass-panel">
                                      <SelectValue placeholder="Select UOM" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card">
                                      {uoms.map(uom => (
                                        <SelectItem key={uom.id} value={uom.code} className="text-blue-200">
                                          {uom.code} - {uom.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="editQaLeader" className="text-blue-200">QA Leader</Label>
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
                              </div>
                              <div>
                                <Label htmlFor="editProblemDescription" className="text-blue-200">Problem Description</Label>
                                <Textarea 
                                  id="editProblemDescription" 
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
                                  onClick={() => handleUpdateReport(editingReport.id, editingReport)}
                                  className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
                                >
                                  Update Report
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                          className="glass-panel hover:bg-red-500/30"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
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