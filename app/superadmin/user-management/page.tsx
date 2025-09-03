"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

// Fixed user lists
const initialQaLeaders = [
  { id: 1, username: "qaleader1", full_name: "QA Leader 1" },
  { id: 2, username: "qaleader2", full_name: "QA Leader 2" },
  { id: 3, username: "qaleader3", full_name: "QA Leader 3" }
]

const initialTeamLeaders = [
  { id: 1, username: "teamlead1", full_name: "Team Leader 1" },
  { id: 2, username: "teamlead2", full_name: "Team Leader 2" },
  { id: 3, username: "teamlead3", full_name: "Team Leader 3" }
]

export default function UserManagementPage() {
  const [qaLeaders, setQaLeaders] = useState(initialQaLeaders)
  const [teamLeaders, setTeamLeaders] = useState(initialTeamLeaders)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({ username: "", full_name: "", password: "" })

  // Load user data from localStorage if available
  useEffect(() => {
    const savedQaLeaders = localStorage.getItem("qaLeaders")
    const savedTeamLeaders = localStorage.getItem("teamLeaders")
    
    if (savedQaLeaders) {
      setQaLeaders(JSON.parse(savedQaLeaders))
    }
    
    if (savedTeamLeaders) {
      setTeamLeaders(JSON.parse(savedTeamLeaders))
    }
  }, [])

  // Save user data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("qaLeaders", JSON.stringify(qaLeaders))
    localStorage.setItem("teamLeaders", JSON.stringify(teamLeaders))
  }, [qaLeaders, teamLeaders])

  const handleEditUser = (user: any, type: "qa" | "team") => {
    setEditingUser({ ...user, type })
    setEditFormData({ 
      username: user.username, 
      full_name: user.full_name || "", 
      password: "" 
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = () => {
    if (!editingUser) return

    if (editingUser.type === "qa") {
      setQaLeaders(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, username: editFormData.username, full_name: editFormData.full_name }
          : user
      ))
    } else {
      setTeamLeaders(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, username: editFormData.username, full_name: editFormData.full_name }
          : user
      ))
    }

    // In a real app, you would also update the password in the database
    if (editFormData.password) {
      toast({
        title: "Password Updated",
        description: `Password for ${editFormData.username} has been updated.`
      })
    }

    setIsEditDialogOpen(false)
    setEditingUser(null)
    toast({
      title: "User Updated",
      description: `${editFormData.username}'s information has been updated.`
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600 mt-1">Manage QA Leaders and Team Leaders</p>
      </div>

      {/* QA Leaders Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>QA Leaders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qaLeaders.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditUser(user, "qa")}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Team Leaders Section */}
      <Card>
        <CardHeader>
          <CardTitle>Team Leaders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamLeaders.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditUser(user, "team")}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={editFormData.username}
                onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="password">New Password (optional)</Label>
              <Input
                id="password"
                type="password"
                value={editFormData.password}
                onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveUser}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}