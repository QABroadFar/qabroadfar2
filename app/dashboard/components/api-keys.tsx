"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { 
  Loader2, 
  Key, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff,
  Trash2,
  Check
} from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
  id: number
  key: string
  service_name: string
  permissions: string[]
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export function ApiKeysManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newApiKey, setNewApiKey] = useState({
    service_name: "",
    permissions: [] as string[]
  })
  const [showKey, setShowKey] = useState<number | null>(null)
  const [copiedKey, setCopiedKey] = useState<number | null>(null)

  // Mock data initialization
  useEffect(() => {
    // In a real implementation, this would fetch from API
    setTimeout(() => {
      const mockApiKeys: ApiKey[] = [
        {
          id: 1,
          key: "sk_1234567890abcdef1234567890abcdef1234567890abcdef",
          service_name: "Mobile App",
          permissions: ["read", "write"],
          created_at: "2023-05-15T10:30:00Z",
          last_used_at: "2023-05-18T14:45:00Z",
          is_active: true
        },
        {
          id: 2,
          key: "sk_0987654321fedcba0987654321fedcba0987654321fedcba",
          service_name: "Data Analytics",
          permissions: ["read"],
          created_at: "2023-05-16T11:20:00Z",
          last_used_at: null,
          is_active: true
        },
        {
          id: 3,
          key: "sk_1357924680abcdef1357924680abcdef1357924680abcdef",
          service_name: "Third-party Integration",
          permissions: ["read", "write", "delete"],
          created_at: "2023-05-17T09:15:00Z",
          last_used_at: "2023-05-17T16:30:00Z",
          is_active: false
        }
      ]
      
      setApiKeys(mockApiKeys)
      setLoading(false)
    }, 1000)
  }, [])

  const handleAddApiKey = () => {
    if (!newApiKey.service_name) {
      toast.error("Service name is required")
      return
    }
    
    const newKey: ApiKey = {
      id: Math.max(0, ...apiKeys.map(k => k.id)) + 1,
      key: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      service_name: newApiKey.service_name,
      permissions: newApiKey.permissions.length > 0 ? newApiKey.permissions : ["read"],
      created_at: new Date().toISOString(),
      last_used_at: null,
      is_active: true
    }
    
    setApiKeys([...apiKeys, newKey])
    setNewApiKey({ service_name: "", permissions: [] })
    setShowAddForm(false)
    toast.success("API key generated successfully")
  }

  const handleTogglePermission = (permission: string) => {
    if (newApiKey.permissions.includes(permission)) {
      setNewApiKey({
        ...newApiKey,
        permissions: newApiKey.permissions.filter(p => p !== permission)
      })
    } else {
      setNewApiKey({
        ...newApiKey,
        permissions: [...newApiKey.permissions, permission]
      })
    }
  }

  const handleDeleteApiKey = (id: number) => {
    setApiKeys(apiKeys.filter(key => key.id !== id))
    toast.success("API key deleted successfully")
  }

  const handleToggleStatus = (id: number) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, is_active: !key.is_active } : key
    ))
    toast.success(`API key ${apiKeys.find(k => k.id === id)?.is_active ? 'deactivated' : 'activated'} successfully`)
  }

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
    toast.success("API key copied to clipboard")
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading API keys...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">API Keys Management</h1>
          <p className="text-gray-600 mt-1">Manage API keys for external integrations</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Generate New Key
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Generate New API Key
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Service Name *</label>
                <Input
                  value={newApiKey.service_name}
                  onChange={(e) => setNewApiKey({...newApiKey, service_name: e.target.value})}
                  placeholder="Enter service name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Permissions</label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="read-permission"
                      checked={newApiKey.permissions.includes("read")}
                      onChange={() => handleTogglePermission("read")}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="read-permission" className="ml-2 text-sm text-gray-700">
                      Read - View data
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="write-permission"
                      checked={newApiKey.permissions.includes("write")}
                      onChange={() => handleTogglePermission("write")}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="write-permission" className="ml-2 text-sm text-gray-700">
                      Write - Create and update data
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="delete-permission"
                      checked={newApiKey.permissions.includes("delete")}
                      onChange={() => handleTogglePermission("delete")}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="delete-permission" className="ml-2 text-sm text-gray-700">
                      Delete - Remove data
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddApiKey}>Generate Key</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Active API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No API keys found</h3>
              <p className="text-gray-500">Generate your first API key to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium">{apiKey.service_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm">
                            {showKey === apiKey.id 
                              ? apiKey.key 
                              : `${apiKey.key.substring(0, 10)}...${apiKey.key.substring(apiKey.key.length - 5)}`}
                          </code>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                          >
                            {showKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                          >
                            {copiedKey === apiKey.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {apiKey.permissions.map((perm) => (
                            <Badge key={perm} variant="secondary" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(apiKey.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{formatDate(apiKey.last_used_at)}</TableCell>
                      <TableCell>
                        <Badge className={apiKey.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {apiKey.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleToggleStatus(apiKey.id)}
                          >
                            {apiKey.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
  )
}