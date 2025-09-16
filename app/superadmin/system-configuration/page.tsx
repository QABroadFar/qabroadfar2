"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { formatToWIB } from "@/lib/date-utils"
import { Plus, Edit, Trash2, Package, Factory, Ruler } from "lucide-react"

export default function SystemConfigurationPage() {
  const [skuCodes, setSkuCodes] = useState<any[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [uoms, setUoms] = useState<any[]>([])
  const [isSkuDialogOpen, setIsSkuDialogOpen] = useState(false)
  const [isMachineDialogOpen, setIsMachineDialogOpen] = useState(false)
  const [isUomDialogOpen, setIsUomDialogOpen] = useState(false)
  const [editingSku, setEditingSku] = useState<any>(null)
  const [editingMachine, setEditingMachine] = useState<any>(null)
  const [editingUom, setEditingUom] = useState<any>(null)
  const [newSku, setNewSku] = useState({ code: "", description: "" })
  const [newMachine, setNewMachine] = useState({ code: "", name: "" })
  const [newUom, setNewUom] = useState({ code: "", name: "" })

  useEffect(() => {
    fetchSKUCodes()
    fetchMachines()
    fetchUOMs()
  }, [])

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

  const handleCreateSKU = async () => {
    try {
      const response = await fetch("/api/system-settings/sku-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newSku)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "SKU code created successfully"
        })
        setIsSkuDialogOpen(false)
        setNewSku({ code: "", description: "" })
        fetchSKUCodes()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to create SKU code",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating SKU code:", error)
      toast({
        title: "Error",
        description: "Failed to create SKU code",
        variant: "destructive"
      })
    }
  }

  const handleUpdateSKU = async (id: number, updatedData: any) => {
    try {
      const response = await fetch("/api/system-settings/sku-codes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, ...updatedData })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "SKU code updated successfully"
        })
        setIsSkuDialogOpen(false)
        setEditingSku(null)
        fetchSKUCodes()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update SKU code",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating SKU code:", error)
      toast({
        title: "Error",
        description: "Failed to update SKU code",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSKU = async (id: number) => {
    if (!confirm("Are you sure you want to delete this SKU code?")) {
      return
    }

    try {
      const response = await fetch(`/api/system-settings/sku-codes?id=${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "SKU code deleted successfully"
        })
        fetchSKUCodes()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete SKU code",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting SKU code:", error)
      toast({
        title: "Error",
        description: "Failed to delete SKU code",
        variant: "destructive"
      })
    }
  }

  const handleCreateMachine = async () => {
    try {
      const response = await fetch("/api/system-settings/machines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newMachine)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Machine created successfully"
        })
        setIsMachineDialogOpen(false)
        setNewMachine({ code: "", name: "" })
        fetchMachines()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to create machine",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating machine:", error)
      toast({
        title: "Error",
        description: "Failed to create machine",
        variant: "destructive"
      })
    }
  }

  const handleUpdateMachine = async (id: number, updatedData: any) => {
    try {
      const response = await fetch("/api/system-settings/machines", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, ...updatedData })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Machine updated successfully"
        })
        setIsMachineDialogOpen(false)
        setEditingMachine(null)
        fetchMachines()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update machine",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating machine:", error)
      toast({
        title: "Error",
        description: "Failed to update machine",
        variant: "destructive"
      })
    }
  }

  const handleDeleteMachine = async (id: number) => {
    if (!confirm("Are you sure you want to delete this machine?")) {
      return
    }

    try {
      const response = await fetch(`/api/system-settings/machines?id=${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Machine deleted successfully"
        })
        fetchMachines()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete machine",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting machine:", error)
      toast({
        title: "Error",
        description: "Failed to delete machine",
        variant: "destructive"
      })
    }
  }

  const handleCreateUOM = async () => {
    try {
      const response = await fetch("/api/system-settings/uoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newUom)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "UOM created successfully"
        })
        setIsUomDialogOpen(false)
        setNewUom({ code: "", name: "" })
        fetchUOMs()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to create UOM",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating UOM:", error)
      toast({
        title: "Error",
        description: "Failed to create UOM",
        variant: "destructive"
      })
    }
  }

  const handleUpdateUOM = async (id: number, updatedData: any) => {
    try {
      const response = await fetch("/api/system-settings/uoms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, ...updatedData })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "UOM updated successfully"
        })
        setIsUomDialogOpen(false)
        setEditingUom(null)
        fetchUOMs()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update UOM",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating UOM:", error)
      toast({
        title: "Error",
        description: "Failed to update UOM",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUOM = async (id: number) => {
    if (!confirm("Are you sure you want to delete this UOM?")) {
      return
    }

    try {
      const response = await fetch(`/api/system-settings/uoms?id=${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "UOM deleted successfully"
        })
        fetchUOMs()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete UOM",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting UOM:", error)
      toast({
        title: "Error",
        description: "Failed to delete UOM",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold futuristic-heading">System Configuration</h1>
          <p className="text-blue-300">Manage system-wide configuration settings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* SKU Codes Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 futuristic-subheading">
              <Package className="h-5 w-5 text-blue-300" />
              SKU Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Dialog open={isSkuDialogOpen && !editingSku} onOpenChange={setIsSkuDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingSku(null)
                      setNewSku({ code: "", description: "" })
                    }}
                    className="glass-panel"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New SKU Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card">
                  <DialogHeader>
                    <DialogTitle className="futuristic-heading">
                      {editingSku ? "Edit SKU Code" : "Add New SKU Code"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="skuCode" className="text-blue-200">Code</Label>
                      <Input
                        id="skuCode"
                        value={editingSku ? editingSku.code : newSku.code}
                        onChange={(e) => 
                          editingSku 
                            ? setEditingSku({...editingSku, code: e.target.value})
                            : setNewSku({...newSku, code: e.target.value})
                        }
                        placeholder="Enter SKU code"
                        className="glass-panel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="skuDescription" className="text-blue-200">Description</Label>
                      <Textarea
                        id="skuDescription"
                        value={editingSku ? editingSku.description : newSku.description}
                        onChange={(e) => 
                          editingSku 
                            ? setEditingSku({...editingSku, description: e.target.value})
                            : setNewSku({...newSku, description: e.target.value})
                        }
                        placeholder="Enter description"
                        rows={3}
                        className="glass-panel"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsSkuDialogOpen(false)}
                        className="glass-panel text-blue-200 hover:bg-blue-500/30"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => 
                          editingSku 
                            ? handleUpdateSKU(editingSku.id, editingSku)
                            : handleCreateSKU()
                        }
                        className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
                      >
                        {editingSku ? "Update SKU" : "Create SKU"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-blue-200">Code</TableHead>
                    <TableHead className="text-blue-200">Description</TableHead>
                    <TableHead className="text-blue-200">Created At</TableHead>
                    <TableHead className="text-blue-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skuCodes.map((sku) => (
                    <TableRow key={sku.id} className="glass-panel">
                      <TableCell className="font-medium text-blue-100">{sku.code}</TableCell>
                      <TableCell className="text-blue-200">{sku.description}</TableCell>
                      <TableCell className="text-blue-200">{formatToWIB(sku.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog open={isSkuDialogOpen && editingSku?.id === sku.id} onOpenChange={setIsSkuDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingSku(sku)
                                  setIsSkuDialogOpen(true)
                                }}
                                className="glass-panel text-blue-200 hover:bg-blue-500/30"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="glass-card">
                              <DialogHeader>
                                <DialogTitle className="futuristic-heading">Edit SKU Code</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="editSkuCode" className="text-blue-200">Code</Label>
                                  <Input
                                    id="editSkuCode"
                                    value={editingSku?.code || ""}
                                    onChange={(e) => setEditingSku({...editingSku, code: e.target.value})}
                                    placeholder="Enter SKU code"
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editSkuDescription" className="text-blue-200">Description</Label>
                                  <Textarea
                                    id="editSkuDescription"
                                    value={editingSku?.description || ""}
                                    onChange={(e) => setEditingSku({...editingSku, description: e.target.value})}
                                    placeholder="Enter description"
                                    rows={3}
                                    className="glass-panel"
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setIsSkuDialogOpen(false)}
                                    className="glass-panel text-blue-200 hover:bg-blue-500/30"
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => handleUpdateSKU(editingSku.id, editingSku)}
                                    className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
                                  >
                                    Update SKU
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteSKU(sku.id)}
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

        {/* Machines Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 futuristic-subheading">
              <Factory className="h-5 w-5 text-blue-300" />
              Machines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Dialog open={isMachineDialogOpen && !editingMachine} onOpenChange={setIsMachineDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingMachine(null)
                      setNewMachine({ code: "", name: "" })
                    }}
                    className="glass-panel"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Machine
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card">
                  <DialogHeader>
                    <DialogTitle className="futuristic-heading">
                      {editingMachine ? "Edit Machine" : "Add New Machine"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="machineCode" className="text-blue-200">Code</Label>
                      <Input
                        id="machineCode"
                        value={editingMachine ? editingMachine.code : newMachine.code}
                        onChange={(e) => 
                          editingMachine 
                            ? setEditingMachine({...editingMachine, code: e.target.value})
                            : setNewMachine({...newMachine, code: e.target.value})
                        }
                        placeholder="Enter machine code"
                        className="glass-panel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="machineName" className="text-blue-200">Name</Label>
                      <Input
                        id="machineName"
                        value={editingMachine ? editingMachine.name : newMachine.name}
                        onChange={(e) => 
                          editingMachine 
                            ? setEditingMachine({...editingMachine, name: e.target.value})
                            : setNewMachine({...newMachine, name: e.target.value})
                        }
                        placeholder="Enter machine name"
                        className="glass-panel"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsMachineDialogOpen(false)}
                        className="glass-panel text-blue-200 hover:bg-blue-500/30"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => 
                          editingMachine 
                            ? handleUpdateMachine(editingMachine.id, editingMachine)
                            : handleCreateMachine()
                        }
                        className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
                      >
                        {editingMachine ? "Update Machine" : "Create Machine"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-blue-200">Code</TableHead>
                    <TableHead className="text-blue-200">Name</TableHead>
                    <TableHead className="text-blue-200">Created At</TableHead>
                    <TableHead className="text-blue-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machines.map((machine) => (
                    <TableRow key={machine.id} className="glass-panel">
                      <TableCell className="font-medium text-blue-100">{machine.code}</TableCell>
                      <TableCell className="text-blue-200">{machine.name}</TableCell>
                      <TableCell className="text-blue-200">{formatToWIB(machine.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog open={isMachineDialogOpen && editingMachine?.id === machine.id} onOpenChange={setIsMachineDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingMachine(machine)
                                  setIsMachineDialogOpen(true)
                                }}
                                className="glass-panel text-blue-200 hover:bg-blue-500/30"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="glass-card">
                              <DialogHeader>
                                <DialogTitle className="futuristic-heading">Edit Machine</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="editMachineCode" className="text-blue-200">Code</Label>
                                  <Input
                                    id="editMachineCode"
                                    value={editingMachine?.code || ""}
                                    onChange={(e) => setEditingMachine({...editingMachine, code: e.target.value})}
                                    placeholder="Enter machine code"
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editMachineName" className="text-blue-200">Name</Label>
                                  <Input
                                    id="editMachineName"
                                    value={editingMachine?.name || ""}
                                    onChange={(e) => setEditingMachine({...editingMachine, name: e.target.value})}
                                    placeholder="Enter machine name"
                                    className="glass-panel"
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setIsMachineDialogOpen(false)}
                                    className="glass-panel text-blue-200 hover:bg-blue-500/30"
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => handleUpdateMachine(editingMachine.id, editingMachine)}
                                    className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
                                  >
                                    Update Machine
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteMachine(machine.id)}
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

        {/* UOMs Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 futuristic-subheading">
              <Ruler className="h-5 w-5 text-blue-300" />
              Units of Measure (UOM)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Dialog open={isUomDialogOpen && !editingUom} onOpenChange={setIsUomDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingUom(null)
                      setNewUom({ code: "", name: "" })
                    }}
                    className="glass-panel"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New UOM
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card">
                  <DialogHeader>
                    <DialogTitle className="futuristic-heading">
                      {editingUom ? "Edit UOM" : "Add New UOM"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="uomCode" className="text-blue-200">Code</Label>
                      <Input
                        id="uomCode"
                        value={editingUom ? editingUom.code : newUom.code}
                        onChange={(e) => 
                          editingUom 
                            ? setEditingUom({...editingUom, code: e.target.value})
                            : setNewUom({...newUom, code: e.target.value})
                        }
                        placeholder="Enter UOM code"
                        className="glass-panel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="uomName" className="text-blue-200">Name</Label>
                      <Input
                        id="uomName"
                        value={editingUom ? editingUom.name : newUom.name}
                        onChange={(e) => 
                          editingUom 
                            ? setEditingUom({...editingUom, name: e.target.value})
                            : setNewUom({...newUom, name: e.target.value})
                        }
                        placeholder="Enter UOM name"
                        className="glass-panel"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsUomDialogOpen(false)}
                        className="glass-panel text-blue-200 hover:bg-blue-500/30"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => 
                          editingUom 
                            ? handleUpdateUOM(editingUom.id, editingUom)
                            : handleCreateUOM()
                        }
                        className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
                      >
                        {editingUom ? "Update UOM" : "Create UOM"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-blue-200">Code</TableHead>
                    <TableHead className="text-blue-200">Name</TableHead>
                    <TableHead className="text-blue-200">Created At</TableHead>
                    <TableHead className="text-blue-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uoms.map((uom) => (
                    <TableRow key={uom.id} className="glass-panel">
                      <TableCell className="font-medium text-blue-100">{uom.code}</TableCell>
                      <TableCell className="text-blue-200">{uom.name}</TableCell>
                      <TableCell className="text-blue-200">{formatToWIB(uom.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog open={isUomDialogOpen && editingUom?.id === uom.id} onOpenChange={setIsUomDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingUom(uom)
                                  setIsUomDialogOpen(true)
                                }}
                                className="glass-panel text-blue-200 hover:bg-blue-500/30"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="glass-card">
                              <DialogHeader>
                                <DialogTitle className="futuristic-heading">Edit UOM</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="editUomCode" className="text-blue-200">Code</Label>
                                  <Input
                                    id="editUomCode"
                                    value={editingUom?.code || ""}
                                    onChange={(e) => setEditingUom({...editingUom, code: e.target.value})}
                                    placeholder="Enter UOM code"
                                    className="glass-panel"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editUomName" className="text-blue-200">Name</Label>
                                  <Input
                                    id="editUomName"
                                    value={editingUom?.name || ""}
                                    onChange={(e) => setEditingUom({...editingUom, name: e.target.value})}
                                    placeholder="Enter UOM name"
                                    className="glass-panel"
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setIsUomDialogOpen(false)}
                                    className="glass-panel text-blue-200 hover:bg-blue-500/30"
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => handleUpdateUOM(editingUom.id, editingUom)}
                                    className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
                                  >
                                    Update UOM
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteUOM(uom.id)}
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
    </div>
  )
}