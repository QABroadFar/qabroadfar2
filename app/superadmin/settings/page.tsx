"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

export default function SystemSettingsPage() {
  const [apiKeys, setApiKeys] = useState([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newApiKey, setNewApiKey] = useState({
    serviceName: "",
    permissions: []
  })
  const [createdKey, setCreatedKey] = useState(null)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/api-keys")
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch API keys",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive"
      })
    }
  }

  const handleCreateApiKey = async () => {
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceName: newApiKey.serviceName,
          permissions: newApiKey.permissions
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCreatedKey(data.apiKey)
        fetchApiKeys()
        setNewApiKey({
          serviceName: "",
          permissions: []
        })
        toast({
          title: "Success",
          description: "API key created successfully"
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to create API key",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating API key:", error)
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      })
    }
  }

  const handleDeleteApiKey = async (id) => {
    if (!confirm("Are you sure you want to delete this API key?")) {
      return
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "API key deleted successfully"
        })
        fetchApiKeys()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete API key",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      })
    }
  }

  const handleToggleApiKeyStatus = async (id, isActive) => {
    try {
      // Get current API key details first
      const getKeyResponse = await fetch(`/api/api-keys/${id}`)
      if (!getKeyResponse.ok) {
        toast({
          title: "Error",
          description: "Failed to fetch API key details",
          variant: "destructive"
        })
        return
      }
      
      const keyData = await getKeyResponse.json()
      
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceName: keyData.service_name,
          permissions: JSON.parse(keyData.permissions),
          isActive: !isActive
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `API key ${!isActive ? "activated" : "deactivated"} successfully`
        })
        fetchApiKeys()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update API key",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating API key:", error)
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">System Settings</CardTitle>
            <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
          </CardHeader>
          <CardContent>
            {/* API Keys Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">API Keys</h3>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Create New API Key</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New API Key</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="serviceName">Service Name</Label>
                        <Input
                          id="serviceName"
                          value={newApiKey.serviceName}
                          onChange={(e) => setNewApiKey({...newApiKey, serviceName: e.target.value})}
                          placeholder="Enter service name"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateApiKey}>
                          Create API Key
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {createdKey && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="font-medium text-green-800">New API Key Created:</p>
                  <p className="font-mono text-sm break-all mt-2">{createdKey}</p>
                  <p className="text-sm text-green-700 mt-2">
                    Please copy this key now. You won't be able to see it again!
                  </p>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.service_name}</TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {key.key.substring(0, 4)}...{key.key.substring(key.key.length - 4)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {JSON.parse(key.permissions).join(", ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={key.is_active === 1}
                            onCheckedChange={() => handleToggleApiKeyStatus(key.id, key.is_active === 1)}
                          />
                          <span className="ml-2 text-sm">
                            {key.is_active === 1 ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {key.last_used_at 
                            ? new Date(key.last_used_at).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteApiKey(key.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}