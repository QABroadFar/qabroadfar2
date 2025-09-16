"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/app/dashboard/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface UserInfo {
  id: number
  username: string
  role: string
  fullName?: string
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [activeComponent, setActiveComponent] = useState<string>("dashboard")

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUserInfo(data.user)
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
        router.push("/login")
      }
    }

    fetchUserInfo()
  }, [router])

  // Map pathname to component names
  useEffect(() => {
    const pathMap: Record<string, string> = {
      "/superadmin/dashboard": "dashboard",
      "/superadmin/user-management": "user-management",
      "/superadmin/ncp-management": "ncp-management",
      "/superadmin/workflow-intervention": "workflow-intervention",
      "/superadmin/system-configuration": "system-configuration",
      "/superadmin/audit-logs": "audit-log",
      "/superadmin/settings": "settings"
    }
    
    const component = pathMap[pathname] || "dashboard"
    setActiveComponent(component)
  }, [pathname])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      
      if (response.ok) {
        router.push("/login")
      } else {
        toast({
          title: "Error",
          description: "Failed to logout",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SidebarProvider>
        {userInfo && (
          <AppSidebar 
            userInfo={userInfo} 
            currentPage={activeComponent}
            setCurrentPage={(component) => {
              setActiveComponent(component)
              // Map component names back to paths
              const componentMap: Record<string, string> = {
                "dashboard": "/superadmin/dashboard",
                "user-management": "/superadmin/user-management",
                "ncp-management": "/superadmin/ncp-management",
                "workflow-intervention": "/superadmin/workflow-intervention",
                "system-configuration": "/superadmin/system-configuration",
                "audit-log": "/superadmin/audit-logs",
                "settings": "/superadmin/settings"
              }
              
              const path = componentMap[component] || "/superadmin/dashboard"
              router.push(path)
            }}
          />
        )}
        <div className="flex flex-col flex-1">
          <DashboardHeader userInfo={userInfo} onLogout={handleLogout} />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}