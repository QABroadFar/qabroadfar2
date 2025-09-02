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

export default function NCPManagementPage() {
  const [ncpReports, setNcpReports] = useState([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
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
  const [users, setUsers] = useState([])
  const [skuCodes, setSkuCodes] = useState([])
  const [machines, setMachines] = useState([])
  const [uoms, setUoms] = useState([])

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

  const handleUpdateReport = async (reportId, updatedData) => {
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

  const handleDeleteReport = async (reportId) => {
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
            <CardTitle className="text-3xl font-bold text-gray-800">NCP Report Management</CardTitle>
            <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
          </CardHeader>
          <CardContent>
            {/* Create NCP Report Button */}
            <div className="mb-6">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create New NCP Report</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Create New NCP Report</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newSkuCode">SKU Code</Label>
                        <Select 
                          value={newReport.skuCode} 
                          onValueChange={(value) => setNewReport({...newReport, skuCode: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select SKU code" />
                          </SelectTrigger>
                          <SelectContent>
                            {skuCodes.map(sku => (
                              <SelectItem key={sku.id} value={sku.code}>
                                {sku.code} - {sku.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="newMachineCode">Machine Code</Label>
                        <Select 
                          value={newReport.machineCode} 
                          onValueChange={(value) => setNewReport({...newReport, machineCode: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select machine" />
                          </SelectTrigger>
                          <SelectContent>
                            {machines.map(machine => (
                              <SelectItem key={machine.id} value={machine.code}>
                                {machine.code} - {machine.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="newDate">Date</Label>
                        <Input 
                          id="newDate" 
                          type="date"
                          value={newReport.date} 
                          onChange={(e) => setNewReport({...newReport, date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="newTimeIncident">Time Incident</Label>
                        <Input 
                          id="newTimeIncident" 
                          type="time"
                          value={newReport.timeIncident} 
                          onChange={(e) => setNewReport({...newReport, timeIncident: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="newHoldQuantity">Hold Quantity</Label>
                        <Input 
                          id="newHoldQuantity" 
                          type="number"
                          value={newReport.holdQuantity} 
                          onChange={(e) => setNewReport({...newReport, holdQuantity: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="newHoldQuantityUOM">Hold Quantity UOM</Label>
                        <Select 
                          value={newReport.holdQuantityUOM} 
                          onValueChange={(value) => setNewReport({...newReport, holdQuantityUOM: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select UOM" />
                          </SelectTrigger>
                          <SelectContent>
                            {uoms.map(uom => (
                              <SelectItem key={uom.id} value={uom.code}>
                                {uom.code} - {uom.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="newQaLeader">QA Leader</Label>
                        <Select 
                          value={newReport.qaLeader} 
                          onValueChange={(value) => setNewReport({...newReport, qaLeader: value})}
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
                    </div>
                    <div>
                      <Label htmlFor="newProblemDescription">Problem Description</Label>
                      <Textarea 
                        id="newProblemDescription" 
                        value={newReport.problemDescription} 
                        onChange={(e) => setNewReport({...newReport, problemDescription: e.target.value})}
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateReport}
                        disabled={!newReport.skuCode || !newReport.machineCode || !newReport.date || !newReport.timeIncident || !newReport.holdQuantity || !newReport.holdQuantityUOM || !newReport.problemDescription || !newReport.qaLeader}
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
                    <TableHead>NCP ID</TableHead>
                    <TableHead>SKU Code</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>QA Leader</TableHead>
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
                                    <Label htmlFor="editNcpId">NCP ID</Label>
                                    <Input id="editNcpId" value={editingReport?.ncp_id || ""} disabled />
                                  </div>
                                  <div>
                                    <Label htmlFor="editSkuCode">SKU Code</Label>
                                    <Select 
                                      value={editingReport?.sku_code || ""} 
                                      onValueChange={(value) => setEditingReport({...editingReport, sku_code: value})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select SKU code" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {skuCodes.map(sku => (
                                          <SelectItem key={sku.id} value={sku.code}>
                                            {sku.code} - {sku.description}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="editMachineCode">Machine Code</Label>
                                    <Select 
                                      value={editingReport?.machine_code || ""} 
                                      onValueChange={(value) => setEditingReport({...editingReport, machine_code: value})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select machine" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {machines.map(machine => (
                                          <SelectItem key={machine.id} value={machine.code}>
                                            {machine.code} - {machine.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="editDate">Date</Label>
                                    <Input 
                                      id="editDate" 
                                      type="date"
                                      value={editingReport?.date || ""} 
                                      onChange={(e) => setEditingReport({...editingReport, date: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editTimeIncident">Time Incident</Label>
                                    <Input 
                                      id="editTimeIncident" 
                                      type="time"
                                      value={editingReport?.time_incident || ""} 
                                      onChange={(e) => setEditingReport({...editingReport, time_incident: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editHoldQuantity">Hold Quantity</Label>
                                    <Input 
                                      id="editHoldQuantity" 
                                      type="number"
                                      value={editingReport?.hold_quantity || ""} 
                                      onChange={(e) => setEditingReport({...editingReport, hold_quantity: parseInt(e.target.value) || 0})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editHoldQuantityUOM">Hold Quantity UOM</Label>
                                    <Select 
                                      value={editingReport?.hold_quantity_uom || ""} 
                                      onValueChange={(value) => setEditingReport({...editingReport, hold_quantity_uom: value})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select UOM" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {uoms.map(uom => (
                                          <SelectItem key={uom.id} value={uom.code}>
                                            {uom.code} - {uom.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="editQaLeader">QA Leader</Label>
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
                                </div>
                                <div>
                                  <Label htmlFor="editProblemDescription">Problem Description</Label>
                                  <Textarea 
                                    id="editProblemDescription" 
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
                                    onClick={() => handleUpdateReport(editingReport.id, editingReport)}
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
                          >
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
    </div>
  )
}