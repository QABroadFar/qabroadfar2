"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const UserManagementPage = () => {
  const [users, setUsers] = useState<any[]>([])
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null)
  const [newPassword, setNewPassword] = useState("")

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setSession(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch session", error)
      }
    }

    fetchSession()
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      if (session?.role === "super_admin") {
        try {
          const res = await fetch("/api/users")
          const data = await res.json()
          setUsers(data)
        } catch (error) {
          console.error("Failed to fetch users", error)
        }
      }
      setLoading(false)
    }

    if (session) {
      fetchUsers()
    }
  }, [session])

  if (loading) {
    return <div>Loading...</div>
  }

  if (session?.role !== "super_admin") {
    return <div>Access Denied</div>
  }

  const handleStatusChange = async (user: any, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      });
      if (response.ok) {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data);
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleRoleChange = async (user: any, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data);
      } else {
        console.error("Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleOpenPasswordDialog = (user: any) => {
    setSelectedUserForPassword(user)
    setShowPasswordDialog(true)
    setNewPassword("")
  }

  const handlePasswordReset = async () => {
    if (!selectedUserForPassword || !newPassword) return
    try {
      const response = await fetch(`/api/users/${selectedUserForPassword.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (response.ok) {
        setShowPasswordDialog(false)
      } else {
        console.error("Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>
                <Select value={user.role} onValueChange={(newRole) => handleRoleChange(user, newRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
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
              <TableCell>
                <Button variant="outline" onClick={() => handleOpenPasswordDialog(user)}>Reset Password</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password for {selectedUserForPassword?.username}</DialogTitle>
            <DialogDescription>
              Enter a new password for the user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordReset}>Confirm Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserManagementPage
