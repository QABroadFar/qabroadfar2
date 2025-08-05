"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { DashboardHeader } from "./components/dashboard-header"
import { WelcomeContent } from "./components/welcome-content"
import { NCPInputForm } from "./components/ncp-input-form"
import { QALeaderApproval } from "./components/qa-leader-approval"
import { TeamLeaderProcessing } from "./components/team-leader-processing"
import { ProcessLeadApproval } from "./components/process-lead-approval"
import { QAManagerApproval } from "./components/qa-manager-approval"

interface UserInfo {
  id: number
  username: string
  role: string
}

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [currentPage, setCurrentPage] = useState("overview")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserInfo()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side session/cookies
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear any local storage
      localStorage.clear()
      sessionStorage.clear()

      // Redirect to login
      router.push("/login")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!userInfo) {
    return null
  }

  const renderContent = () => {
    switch (currentPage) {
      case "ncp-input":
        return <NCPInputForm userInfo={userInfo} />
      case "qa-approval":
        return <QALeaderApproval userInfo={userInfo} />
      case "tl-processing":
        return <TeamLeaderProcessing userInfo={userInfo} />
      case "process-approval":
        return <ProcessLeadApproval userInfo={userInfo} />
      case "qa-manager-approval":
        return <QAManagerApproval userInfo={userInfo} />
      default:
        return <WelcomeContent userInfo={userInfo} />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar userInfo={userInfo} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <SidebarInset>
        <DashboardHeader onLogout={handleLogout} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}