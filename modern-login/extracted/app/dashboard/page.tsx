"use client"

import { useState } from "react"
import { AppSidebar } from "./components/app-sidebar"
import { DashboardHeader } from "./components/dashboard-header"
import { WelcomeContent } from "./components/welcome-content"
import { NCPInputForm } from "./components/ncp-input-form"
import { QALeaderApproval } from "./components/qa-leader-approval"
import { TeamLeaderProcessing } from "./components/team-leader-processing"
import { ProcessLeadApproval } from "./components/process-lead-approval"
import { QAManagerApproval } from "./components/qa-manager-approval"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface DashboardPageProps {
  onLogout: () => void
}

export default function DashboardPage({ onLogout }: DashboardPageProps) {
  const [currentPage, setCurrentPage] = useState("dashboard")

  const renderContent = () => {
    switch (currentPage) {
      case "input-ncp":
        return <NCPInputForm onBack={() => setCurrentPage("dashboard")} />
      case "qa-approval":
        return <QALeaderApproval onBack={() => setCurrentPage("dashboard")} />
      case "tl-processing":
        return <TeamLeaderProcessing onBack={() => setCurrentPage("dashboard")} />
      case "process-approval":
        return <ProcessLeadApproval onBack={() => setCurrentPage("dashboard")} />
      case "database-ncp":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">Database NCP</h1>
            <p className="text-gray-600 mt-2">Database NCP functionality coming soon...</p>
          </div>
        )
      case "qa-manager-approval":
        return <QAManagerApproval onBack={() => setCurrentPage("dashboard")} />
      default:
        return <WelcomeContent onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SidebarProvider>
        <AppSidebar onNavigate={setCurrentPage} currentPage={currentPage} />
        <SidebarInset>
          <DashboardHeader onLogout={onLogout} />
          <main className="flex-1">{renderContent()}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
