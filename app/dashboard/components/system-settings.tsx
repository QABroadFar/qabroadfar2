"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Loader2, 
  Database, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Settings,
  FileText,
  Wrench,
  Package
} from "lucide-react"

interface SKUCode {
  id: number
  code: string
  description: string
}

interface Machine {
  id: number
  code: string
  name: string
}

interface UOM {
  id: number
  code: string
  name: string
}

export function SystemSettings() {
  // State for different setting sections
  const [skuCodes, setSkuCodes] = useState<SKUCode[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [uoms, setUoms] = useState<UOM[]>([])
  
  // State for forms
  const [newSkuCode, setNewSkuCode] = useState({ code: "", description: "" })
  const [newMachine, setNewMachine] = useState({ code: "", name: "" })
  const [newUom, setNewUom] = useState({ code: "", name: "" })
  
  // State for editing
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editType, setEditType] = useState<"sku" | "machine" | "uom" | null>(null)
  const [editData, setEditData] = useState<any>({})
  
  // Loading state
  const [loading, setLoading] = useState(true)
  
  // NCP numbering format
  const [ncpFormat, setNcpFormat] = useState("YYMM-XXXX")
  const [autoReset, setAutoReset] = useState(true)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch SKU codes
        const skuResponse = await fetch("/api/system-settings/sku-codes")
        if (skuResponse.ok) {
          const skuData = await skuResponse.json()
          setSkuCodes(skuData)
        }
        
        // Fetch machines
        const machineResponse = await fetch("/api/system-settings/machines")
        if (machineResponse.ok) {
          const machineData = await machineResponse.json()
          setMachines(machineData)
        }
        
        // Fetch UOMs
        const uomResponse = await fetch("/api/system-settings/uoms")
        if (uomResponse.ok) {
          const uomData = await uomResponse.json()
          setUoms(uomData)
        }
        
        // Fetch NCP format settings
        const formatResponse = await fetch("/api/system-settings/config?key=ncp_format")
        if (formatResponse.ok) {
          const formatData = await formatResponse.json()
          setNcpFormat(formatData.value || "YYMM-XXXX")
        }
        
        // Fetch auto reset setting
        const autoResetResponse = await fetch("/api/system-settings/config?key=auto_reset")
        if (autoResetResponse.ok) {
          const autoResetData = await autoResetResponse.json()
          setAutoReset(autoResetData.value === "true")
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching system settings:", error)
        toast.error("Failed to load system settings")
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // CRUD operations for SKU Codes
  const handleAddSkuCode = async () => {
    if (!newSkuCode.code) {
      toast.error("SKU code is required")
      return
    }
    
    try {
      const response = await fetch("/api/system-settings/sku-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSkuCode),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Refresh the list
        const skuResponse = await fetch("/api/system-settings/sku-codes")
        if (skuResponse.ok) {
          const skuData = await skuResponse.json()
          setSkuCodes(skuData)
        }
        
        setNewSkuCode({ code: "", description: "" })
        toast.success("SKU code added successfully")
      } else {
        toast.error(result.error || "Failed to add SKU code")
      }
    } catch (error) {
      console.error("Error adding SKU code:", error)
      toast.error("Failed to add SKU code")
    }
  }

  const handleEditSkuCode = (sku: SKUCode) => {
    setEditingId(sku.id)
    setEditType("sku")
    setEditData({ ...sku })
  }

  const handleSaveEditSkuCode = async () => {
    try {
      const response = await fetch("/api/system-settings/sku-codes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Refresh the list
        const skuResponse = await fetch("/api/system-settings/sku-codes")
        if (skuResponse.ok) {
          const skuData = await skuResponse.json()
          setSkuCodes(skuData)
        }
        
        setEditingId(null)
        setEditType(null)
        setEditData({})
        toast.success("SKU code updated successfully")
      } else {
        toast.error(result.error || "Failed to update SKU code")
      }
    } catch (error) {
      console.error("Error updating SKU code:", error)
      toast.error("Failed to update SKU code")
    }
  }

  const handleDeleteSkuCode = async (id: number) => {
    try {
      const response = await fetch(`/api/system-settings/sku-codes?id=${id}`, {
        method: "DELETE",
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Refresh the list
        const skuResponse = await fetch("/api/system-settings/sku-codes")
        if (skuResponse.ok) {
          const skuData = await skuResponse.json()
          setSkuCodes(skuData)
        }
        
        toast.success("SKU code deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete SKU code")
      }
    } catch (error) {
      console.error("Error deleting SKU code:", error)
      toast.error("Failed to delete SKU code")
    }
  }

  // CRUD operations for Machines
  const handleAddMachine = async () => {
    if (!newMachine.code || !newMachine.name) {
      toast.error("Machine code and name are required")
      return
    }
    
    try {
      const response = await fetch("/api/system-settings/machines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMachine),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Refresh the list
        const machineResponse = await fetch("/api/system-settings/machines")
        if (machineResponse.ok) {
          const machineData = await machineResponse.json()
          setMachines(machineData)
        }
        
        setNewMachine({ code: "", name: "" })
        toast.success("Machine added successfully")
      } else {
        toast.error(result.error || "Failed to add machine")
      }
    } catch (error) {
      console.error("Error adding machine:", error)
      toast.error("Failed to add machine")
    }
  }

  const handleEditMachine = (machine: Machine) => {
    setEditingId(machine.id)
    setEditType("machine")
    setEditData({ ...machine })
  }

  const handleSaveEditMachine = async () => {
    try {
      const response = await fetch("/api/system-settings/machines", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Refresh the list
        const machineResponse = await fetch("/api/system-settings/machines")
        if (machineResponse.ok) {
          const machineData = await machineResponse.json()
          setMachines(machineData)
        }
        
        setEditingId(null)
        setEditType(null)
        setEditData({})
        toast.success("Machine updated successfully")
      } else {
        toast.error(result.error || "Failed to update machine")
      }
    } catch (error) {
      console.error("Error updating machine:", error)
      toast.error("Failed to update machine")
    }
  }

  const handleDeleteMachine = async (id: number) => {
    try {
      const response = await fetch(`/api/system-settings/machines?id=${id}`, {
        method: "DELETE",
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Refresh the list
        const machineResponse = await fetch("/api/system-settings/machines")
        if (machineResponse.ok) {
          const machineData = await machineResponse.json()
          setMachines(machineData)
        }
        
        toast.success("Machine deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete machine")
      }
    } catch (error) {
      console.error("Error deleting machine:", error)
      toast.error("Failed to delete machine")
    }
  }

  // CRUD operations for UOMs
  const handleAddUom = async () => {
    if (!newUom.code || !newUom.name) {
      toast.error("UOM code and name are required")
      return
    }
    
    try {
      const response = await fetch("/api/system-settings/uoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUom),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Refresh the list
        const uomResponse = await fetch("/api/system-settings/uoms")
        if (uomResponse.ok) {
          const uomData = await uomResponse.json()
          setUoms(uomData)
        }
        
        setNewUom({ code: "", name: "" })
        toast.success("UOM added successfully")
      } else {
        toast.error(result.error || "Failed to add UOM")
      }
    } catch (error) {
      console.error("Error adding UOM:", error)
      toast.error("Failed to add UOM")
    }
  }

  const handleEditUom = (uom: UOM) => {
    setEditingId(uom.id)
    setEditType("uom")
    setEditData({ ...uom })
  }

  const handleSaveEditUom = async () => {
    try {
      const response = await fetch("/api/system-settings/uoms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Refresh the list
        const uomResponse = await fetch("/api/system-settings/uoms")
        if (uomResponse.ok) {
          const uomData = await uomResponse.json()
          setUoms(uomData)
        }
        
        setEditingId(null)
        setEditType(null)
        setEditData({})
        toast.success("UOM updated successfully")
      } else {
        toast.error(result.error || "Failed to update UOM")
      }
    } catch (error) {
      console.error("Error updating UOM:", error)
      toast.error("Failed to update UOM")
    }
  }

  const handleDeleteUom = async (id: number) => {
    try {
      const response = await fetch(`/api/system-settings/uoms?id=${id}`, {
        method: "DELETE",
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Refresh the list
        const uomResponse = await fetch("/api/system-settings/uoms")
        if (uomResponse.ok) {
          const uomData = await uomResponse.json()
          setUoms(uomData)
        }
        
        toast.success("UOM deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete UOM")
      }
    } catch (error) {
      console.error("Error deleting UOM:", error)
      toast.error("Failed to delete UOM")
    }
  }

  // Save system settings
  const handleSaveSettings = async () => {
    try {
      // Save NCP format
      const formatResponse = await fetch("/api/system-settings/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "ncp_format",
          value: ncpFormat,
          description: "NCP numbering format"
        }),
      })
      
      // Save auto reset setting
      const autoResetResponse = await fetch("/api/system-settings/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "auto_reset",
          value: autoReset.toString(),
          description: "Auto reset serial number monthly"
        }),
      })
      
      if (formatResponse.ok && autoResetResponse.ok) {
        toast.success("System settings saved successfully")
      } else {
        toast.error("Failed to save system settings")
      }
    } catch (error) {
      console.error("Error saving system settings:", error)
      toast.error("Failed to save system settings")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading system settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
        <p className="text-gray-600 mt-1">Manage system-wide configurations and master data</p>
      </div>

      {/* NCP Numbering Settings */}
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            NCP Numbering Format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Format Pattern</label>
              <Input
                value={ncpFormat}
                onChange={(e) => setNcpFormat(e.target.value)}
                placeholder="YYMM-XXXX"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                YY = Year, MM = Month, XXXX = Serial Number
              </p>
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-reset"
                  checked={autoReset}
                  onChange={(e) => setAutoReset(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="auto-reset" className="text-sm font-medium text-gray-700">
                  Auto-reset serial number monthly
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SKU Codes Management */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              SKU Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add New SKU Form */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-3">Add New SKU Code</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Input
                    placeholder="SKU Code"
                    value={newSkuCode.code}
                    onChange={(e) => setNewSkuCode({...newSkuCode, code: e.target.value})}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Description"
                    value={newSkuCode.description}
                    onChange={(e) => setNewSkuCode({...newSkuCode, description: e.target.value})}
                  />
                </div>
                <div>
                  <Button onClick={handleAddSkuCode} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add SKU
                  </Button>
                </div>
              </div>
            </div>

            {/* SKU Codes Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skuCodes.map((sku) => (
                    <TableRow key={sku.id} className="hover:bg-gray-50/50">
                      {editingId === sku.id && editType === "sku" ? (
                        <>
                          <TableCell>
                            <Input
                              value={editData.code}
                              onChange={(e) => setEditData({...editData, code: e.target.value})}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editData.description}
                              onChange={(e) => setEditData({...editData, description: e.target.value})}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" onClick={handleSaveEditSkuCode} className="mr-2">
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setEditingId(null)
                                setEditType(null)
                                setEditData({})
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{sku.code}</TableCell>
                          <TableCell>{sku.description}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditSkuCode(sku)}
                              className="mr-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteSkuCode(sku.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Machines Management */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Machines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add New Machine Form */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Add New Machine</h3>
              <div className="space-y-2">
                <Input
                  placeholder="Machine Code"
                  value={newMachine.code}
                  onChange={(e) => setNewMachine({...newMachine, code: e.target.value})}
                />
                <Input
                  placeholder="Machine Name"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                />
                <Button onClick={handleAddMachine} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Machine
                </Button>
              </div>
            </div>

            {/* Machines List */}
            <div className="space-y-3">
              {machines.map((machine) => (
                <div 
                  key={machine.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  {editingId === machine.id && editType === "machine" ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editData.code}
                        onChange={(e) => setEditData({...editData, code: e.target.value})}
                        placeholder="Code"
                      />
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        placeholder="Name"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEditMachine}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setEditingId(null)
                            setEditType(null)
                            setEditData({})
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium">{machine.code}</div>
                        <div className="text-sm text-gray-600">{machine.name}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditMachine(machine)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteMachine(machine.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Units of Measure Management */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Units of Measure
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add New UOM Form */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Add New UOM</h3>
              <div className="space-y-2">
                <Input
                  placeholder="UOM Code"
                  value={newUom.code}
                  onChange={(e) => setNewUom({...newUom, code: e.target.value})}
                />
                <Input
                  placeholder="UOM Name"
                  value={newUom.name}
                  onChange={(e) => setNewUom({...newUom, name: e.target.value})}
                />
                <Button onClick={handleAddUom} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add UOM
                </Button>
              </div>
            </div>

            {/* UOMs List */}
            <div className="space-y-3">
              {uoms.map((uom) => (
                <div 
                  key={uom.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  {editingId === uom.id && editType === "uom" ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editData.code}
                        onChange={(e) => setEditData({...editData, code: e.target.value})}
                        placeholder="Code"
                      />
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        placeholder="Name"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEditUom}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setEditingId(null)
                            setEditType(null)
                            setEditData({})
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium">{uom.code}</div>
                        <div className="text-sm text-gray-600">{uom.name}</div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditUom(uom)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteUom(uom.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Database Management */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">Backup Database</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Create a backup of the entire database for safekeeping.
              </p>
              <Button variant="outline" className="w-full" onClick={() => {
                toast.info("Backup feature will be implemented in the next release")
              }}>
                Create Backup
              </Button>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-2">Restore Database</h3>
              <p className="text-sm text-red-700 mb-3">
                Restore database from a previously created backup file.
              </p>
              <Button variant="outline" className="w-full" onClick={() => {
                toast.info("Restore feature will be implemented in the next release")
              }}>
                Restore from Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Settings Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  )
}