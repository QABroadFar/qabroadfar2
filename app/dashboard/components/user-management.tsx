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
import { toast } from "sonner"
import { Loader2, UserPlus, Users, Edit, Key, UserX, Trash2 } from "lucide-react"

interface User {
  id: number
  username: string
  role: string
  full_name: string
  is_active: boolean
  created_at: string
}

interface EditingUser extends User {
  field?: 'username' | 'role' | 'password'
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null)
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "user"
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error("Failed to fetch users")
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Error fetching users")
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUser.username || !newUser.password) {
      toast.error("Username and password are required")
      return
    }
    
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUser.username,
          password: newUser.password,
          role: newUser.role,
          fullName: newUser.fullName
        }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success("User created successfully")
        setNewUser({
          username: "",
          password: "",
          fullName: "",
          role: "user"
        })
        setShowAddUserForm(false)
        fetchUsers() // Refresh the user list
      } else {
        toast.error(result.error || "Failed to create user")
      }
    } catch (error: any) {
      console.error("Error creating user:", error)
      toast.error(`Error creating user: ${error.message}`)
    }
  }

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success("User role updated successfully")
        fetchUsers() // Refresh the user list
      } else {
        toast.error(result.error || "Failed to update user role")
      }
    } catch (error: any) {
      console.error("Error updating user role:", error)
      toast.error(`Error updating user role: ${error.message}`)
    }
  }

  const handleUpdateUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success(`User ${isActive ? "activated" : "deactivated"} successfully`)
        fetchUsers() // Refresh the user list
      } else {
        toast.error(result.error || `Failed to ${isActive ? "activate" : "deactivate"} user`)
      }
    } catch (error: any) {
      console.error("Error updating user status:", error)
      toast.error(`Error updating user status: ${error.message}`)
    }
  }

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt("Enter new password for this user:")
    if (!newPassword) return
    
    try {
      const response = await fetch(`/api/users/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success("User password updated successfully")
      } else {
        toast.error(result.error || "Failed to update user password")
      }
    } catch (error: any) {
      console.error("Error updating user password:", error)
      toast.error(`Error updating user password: ${error.message}`)
    }
  }

  const handleUpdateUsername = async (userId: number, newUsername: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/username`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: newUsername }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success("User username updated successfully")
        fetchUsers() // Refresh the user list
      } else {
        toast.error(result.error || "Failed to update user username")
      }
    } catch (error: any) {
      console.error("Error updating user username:", error)
      toast.error(`Error updating user username: ${error.message}`)
    }
  }

  const handleUpdatePassword = async (userId: number, newPassword: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success("User password updated successfully")
        // Don't refresh users since password update doesn't change displayed info
      } else {
        toast.error(result.error || "Failed to update user password")
      }
    } catch (error: any) {
      console.error("Error updating user password:", error)
      toast.error(`Error updating user password: ${error.message}`)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success("User deleted successfully")
        fetchUsers() // Refresh the user list
      } else {
        toast.error(result.error || "Failed to delete user")
      }
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast.error(`Error deleting user: ${error.message}`)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      super_admin: { label: "Super Admin", className: "bg-red-100 text-red-800" },
      admin: { label: "Admin", className: "bg-purple-100 text-purple-800" },
      qa_manager: { label: "QA Manager", className: "bg-blue-100 text-blue-800" },
      process_lead: { label: "Process Lead", className: "bg-indigo-100 text-indigo-800" },
      team_leader: { label: "Team Leader", className: "bg-green-100 text-green-800" },
      qa_leader: { label: "QA Leader", className: "bg-yellow-100 text-yellow-800" },
      user: { label: "User", className: "bg-gray-100 text-gray-800" },
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, className: "bg-gray-100 text-gray-800" }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading users...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <Button onClick={() => setShowAddUserForm(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {showAddUserForm && (
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Username *</label>
                  <Input
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Enter username"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    placeholder="Enter full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Password *</label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Enter password"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                  >
                    <option value="user">User</option>
                    <option value="qa_leader">QA Leader</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="process_lead">Process Lead</option>
                    <option value="qa_manager">QA Manager</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddUserForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
              <p className="text-gray-500">Get started by adding a new user.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        {editingUser?.id === user.id && editingUser.field === 'username' ? (
                          <div className="flex gap-2">
                            <Input
                              value={editingUser.username}
                              onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                              className="text-sm h-8"
                              autoFocus
                              onBlur={() => {
                                handleUpdateUsername(user.id, editingUser.username)
                                setEditingUser(null)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleUpdateUsername(user.id, editingUser.username)
                                  setEditingUser(null)
                                } else if (e.key === "Escape") {
                                  setEditingUser(null)
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.username}</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => setEditingUser({...user, field: 'username'})}
                              className="p-1"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{user.full_name || "-"}</TableCell>
                      <TableCell>
                        {editingUser?.id === user.id && editingUser.field === 'role' ? (
                          <select
                            value={editingUser.role}
                            onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-200 rounded-md text-sm"
                            autoFocus
                            onBlur={() => {
                              handleUpdateUserRole(user.id, editingUser.role)
                              setEditingUser(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateUserRole(user.id, editingUser.role)
                                setEditingUser(null)
                              } else if (e.key === "Escape") {
                                setEditingUser(null)
                              }
                            }}
                          >
                            <option value="user">User</option>
                            <option value="qa_leader">QA Leader</option>
                            <option value="team_leader">Team Leader</option>
                            <option value="process_lead">Process Lead</option>
                            <option value="qa_manager">QA Manager</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            {getRoleBadge(user.role)}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => setEditingUser({...user, field: 'role'})}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUpdateUserStatus(user.id, !user.is_active)}
                          >
                            {user.is_active ? <UserX className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleResetPassword(user.id)}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
                                handleDeleteUser(user.id)
                              }
                            }}
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