"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Key, Trash2 } from "lucide-react"

const UserManagementPage = () => {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user",
    fullName: ""
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Failed to fetch users", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (user: any, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      })
      if (response.ok) {
        fetchUsers()
        toast({
          title: "Success",
          description: "User status updated successfully"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update user status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      })
    }
  }

  const handleRoleChange = async (user: any, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (response.ok) {
        fetchUsers()
        toast({
          title: "Success",
          description: "User role updated successfully"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      })
    }
  }

  const handleOpenPasswordDialog = (user: any) => {
    setSelectedUserForPassword(user)
    setShowPasswordDialog(true)
    setNewPassword("")
  }

  const handlePasswordReset = async () => {
    if (!selectedUserForPassword || !newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive"
      })
      return
    }
    
    try {
      const response = await fetch(`/api/users/${selectedUserForPassword.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      if (response.ok) {
        setShowPasswordDialog(false)
        toast({
          title: "Success",
          description: "User password updated successfully"
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update password",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive"
      })
    }
  }

  const handleOpenCreateUserDialog = () => {
    setNewUser({
      username: "",
      password: "",
      role: "user",
      fullName: ""
    })
    setShowCreateUserDialog(true)
  }

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }
    
    try {
      const response = await fetch("/api/users", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      if (response.ok) {
        setShowCreateUserDialog(false)
        fetchUsers()
        toast({
          title: "Success",
          description: "User created successfully"
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to create user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Are you sure you want to delete user ${user.username}?`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchUsers()
        toast({
          title: "Success",
          description: "User deleted successfully"
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-blue-200">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold futuristic-heading">User Management</h1>
          <p className="text-blue-300 mt-1">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={handleOpenCreateUserDialog} className="glass-panel">
          <UserPlus className="h-4 w-4 mr-2" />
          Create New User
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 futuristic-subheading">
            <Users className="h-5 w-5 text-blue-300" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-blue-200">Username</TableHead>
                <TableHead className="text-blue-200">Full Name</TableHead>
                <TableHead className="text-blue-200">Role</TableHead>
                <TableHead className="text-blue-200">Status</TableHead>
                <TableHead className="text-blue-200">Created At</TableHead>
                <TableHead className="text-blue-200">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="glass-panel">
                  <TableCell className="font-medium text-blue-100">{user.username}</TableCell>
                  <TableCell className="text-blue-200">{user.full_name || "-"}</TableCell>
                  <TableCell>
                    <Select value={user.role} onValueChange={(newRole) => handleRoleChange(user, newRole)}>
                      <SelectTrigger className="w-[150px] glass-panel text-blue-200">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="qa_leader">QA Leader</SelectItem>
                        <SelectItem value="team_leader">Team Leader</SelectItem>
                        <SelectItem value="process_lead">Process Lead</SelectItem>
                        <SelectItem value="qa_manager">QA Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.is_active}
                      onCheckedChange={(isChecked) => handleStatusChange(user, isChecked)}
                    />
                  </TableCell>
                  <TableCell className="text-blue-200">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenPasswordDialog(user)}
                        className="glass-panel text-blue-200 hover:bg-blue-500/30"
                      >
                        <Key className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.role === "super_admin"}
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
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="futuristic-heading">Reset Password for {selectedUserForPassword?.username}</DialogTitle>
            <DialogDescription className="text-blue-300">
              Enter a new password for the user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-password" className="text-blue-200">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="glass-panel"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordDialog(false)}
              className="glass-panel text-blue-200 hover:bg-blue-500/30"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordReset}
              className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
            >
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="futuristic-heading">Create New User</DialogTitle>
            <DialogDescription className="text-blue-300">
              Enter user details to create a new account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="new-username" className="text-blue-200">Username *</Label>
              <Input
                id="new-username"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                placeholder="Enter username"
                className="glass-panel"
              />
            </div>
            <div>
              <Label htmlFor="new-fullname" className="text-blue-200">Full Name</Label>
              <Input
                id="new-fullname"
                value={newUser.fullName}
                onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                placeholder="Enter full name"
                className="glass-panel"
              />
            </div>
            <div>
              <Label htmlFor="new-password-create" className="text-blue-200">Password *</Label>
              <Input
                id="new-password-create"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Enter password"
                className="glass-panel"
              />
            </div>
            <div>
              <Label htmlFor="new-role" className="text-blue-200">Role *</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                <SelectTrigger className="glass-panel text-blue-200">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="qa_leader">QA Leader</SelectItem>
                  <SelectItem value="team_leader">Team Leader</SelectItem>
                  <SelectItem value="process_lead">Process Lead</SelectItem>
                  <SelectItem value="qa_manager">QA Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateUserDialog(false)}
              className="glass-panel text-blue-200 hover:bg-blue-500/30"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              className="glass-panel bg-blue-600/80 hover:bg-blue-700/80"
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserManagementPage