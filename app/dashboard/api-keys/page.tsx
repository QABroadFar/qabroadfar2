"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ApiKeysPage = () => {
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newKeyData, setNewKeyData] = useState({ service_name: "", permissions: "" })
  const [generatedKey, setGeneratedKey] = useState("")

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const res = await fetch("/api/api-keys")
      if (res.ok) {
        const data = await res.json()
        setApiKeys(data)
      }
    } catch (error) {
      console.error("Failed to fetch API keys", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKey = async () => {
    try {
      const permissionsArray = newKeyData.permissions.split(",").map(p => p.trim());
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newKeyData, permissions: permissionsArray }),
      });
      if (response.ok) {
        const { key } = await response.json();
        setGeneratedKey(key);
        fetchApiKeys();
      }
    } catch (error) {
      console.error("Error creating API key:", error);
    }
  }

  const handleDeleteKey = async (id: number) => {
    try {
      await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
      fetchApiKeys();
    } catch (error) {
      console.error("Error deleting API key:", error);
    }
  }

  if (loading) {
    return <div>Loading API Keys...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">API Key Management</h1>
        <Button onClick={() => {
          setShowCreateDialog(true);
          setGeneratedKey("");
          setNewKeyData({ service_name: "", permissions: "" });
        }}>Create New Key</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service Name</TableHead>
            <TableHead>Key (Prefix)</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((key) => (
            <TableRow key={key.id}>
              <TableCell>{key.service_name}</TableCell>
              <TableCell>{`${key.key.substring(0, 8)}...`}</TableCell>
              <TableCell>{JSON.parse(key.permissions).join(", ")}</TableCell>
              <TableCell>{new Date(key.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <Button variant="destructive" onClick={() => handleDeleteKey(key.id)}>Revoke</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              The key will only be shown once. Please save it securely.
            </DialogDescription>
          </DialogHeader>
          {generatedKey ? (
            <div>
              <p>New API Key:</p>
              <pre className="bg-gray-100 p-2 rounded my-2">{generatedKey}</pre>
              <Button onClick={() => setShowCreateDialog(false)}>Close</Button>
            </div>
          ) : (
            <div className="py-4">
              <Label htmlFor="service-name">Service Name</Label>
              <Input
                id="service-name"
                value={newKeyData.service_name}
                onChange={(e) => setNewKeyData({ ...newKeyData, service_name: e.target.value })}
              />
              <Label htmlFor="permissions" className="mt-4 block">Permissions (comma-separated)</Label>
              <Input
                id="permissions"
                value={newKeyData.permissions}
                onChange={(e) => setNewKeyData({ ...newKeyData, permissions: e.target.value })}
              />
            </div>
          )}
          {!generatedKey && (
            <DialogFooter>
              <Button onClick={handleCreateKey}>Generate Key</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ApiKeysPage
