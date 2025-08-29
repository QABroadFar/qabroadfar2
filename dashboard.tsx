"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "./components/app-sidebar"
import { DashboardHeader } from "./app/dashboard/components/dashboard-header"
import { WelcomeContent } from "./components/welcome-content"
import { RoleSpecificDashboard } from "./app/dashboard/components/role-specific-dashboard"
import { DatabaseNCP } from "./app/dashboard/components/database-ncp"
import { UserManagement } from "./app/dashboard/components/user-management"
import { SystemSettings } from "./app/dashboard/components/system-settings"
import { AuditLog } from "./app/dashboard/components/audit-log"
import { SystemLogs } from "./app/dashboard/components/system-logs"
import { ApiKeysManagement } from "./app/dashboard/components/api-keys"
import { BackupRestore } from "./app/dashboard/components/backup-restore"
import { AnalyticsDashboard } from "./app/dashboard/components/analytics-dashboard"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"

interface UserInfo {
  id: number
  username: string
  role: string
  fullName?: string
}

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [activeComponent, setActiveComponent] = useState<string>("dashboard")
  const router = useRouter()

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUserInfo(data.user)
        } else {
          // If not authenticated, redirect to login
          router.push("/login")
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
        router.push("/login")
      }
    }

    fetchUserInfo()
  }, [router])

  const renderActiveComponent = () => {
    if (!userInfo) return null

    switch (activeComponent) {
      case "dashboard":
        return <RoleSpecificDashboard userInfo={userInfo} />
      case "input":
        return <div className="p-6">Input NCP Component</div>
      case "database":
        return <DatabaseNCP userInfo={userInfo} />
      case "user-management":
        return <UserManagement />
      case "analytics":
        return <AnalyticsDashboard />;
      case "audit-log":
        return <AuditLog />
      case "system-logs":
        return <SystemLogs />
      case "api-keys":
        return <ApiKeysManagement />
      case "backup-restore":
        return <BackupRestore />
      case "settings":
        return <SystemSettings />
      case "settings":
        return <SystemSettings />
      default:
        return <WelcomeContent onNavigate={setActiveComponent} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SidebarProvider>
        <AppSidebar 
          userInfo={userInfo} 
          currentPage={activeComponent}
          setCurrentPage={setActiveComponent}
        />
        <SidebarInset>
          <DashboardHeader userInfo={userInfo} />
          <main className="flex-1">
            {renderActiveComponent()}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
