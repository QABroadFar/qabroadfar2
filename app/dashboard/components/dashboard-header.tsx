"use client"

import { Bell, Search, User, LogOut } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface UserInfo {
  id: number
  username: string
  role: string
  fullName?: string
}

interface DashboardHeaderProps {
  userInfo?: UserInfo | null
  onLogout?: () => void
}

export function DashboardHeader({ userInfo, onLogout }: DashboardHeaderProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // If onLogout prop is provided, call it
      if (onLogout) {
        await onLogout()
      } else {
        // Otherwise, use the default logout logic
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        })
        
        if (response.ok) {
          router.push("/login")
        } else {
          console.error("Logout failed")
        }
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
    }
  }

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      super_admin: "Super Admin",
      admin: "Admin",
      qa_manager: "QA Manager",
      process_lead: "Process Lead",
      team_leader: "Team Leader",
      qa_leader: "QA Leader",
      user: "User"
    }
    return roleMap[role] || role
  }

  return (
    <>
      <header className="flex h-16 items-center gap-4 border-b border-gray-200/20 bg-white/10 backdrop-blur-md px-6">
        <SidebarTrigger className="text-gray-700 hover:text-gray-900" />

        <div className="flex-1 flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white/50 border-gray-200/50 focus:bg-white/80 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
            <Bell className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              {userInfo && (
                <>
                  <div className="px-2 py-1.5 text-sm text-gray-600">
                    <div className="font-medium">{userInfo.fullName || userInfo.username}</div>
                    <div className="text-xs text-gray-500">{getRoleDisplay(userInfo.role)}</div>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="futuristic-heading">Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200">
              Are you sure you want to log out? You will need to sign in again to access the Quality Assurance Portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isLoggingOut} 
              className="glass-panel text-blue-200 hover:bg-blue-500/20"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout} 
              disabled={isLoggingOut} 
              className="bg-red-600/80 hover:bg-red-700/80 text-white"
            >
              {isLoggingOut ? "Logging out..." : "Log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}