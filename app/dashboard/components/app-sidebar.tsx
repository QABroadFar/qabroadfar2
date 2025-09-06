"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Database, CheckCircle, FileInput, Users, Package, FileText, Settings, Cog, Award, Plus, CheckSquare, Wrench, Shield, TrendingUp, Home, Key } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userInfo: { username: string; role: string; fullName?: string; id?: number }
  currentPage: string
  setCurrentPage: (page: string) => void
}

export function AppSidebar({ userInfo: userInfoProp, currentPage, setCurrentPage, ...props }: AppSidebarProps) {
  const userInfo = userInfoProp || { username: "", role: "", fullName: "" }

  const getMenuItems = () => {
    const baseItems = [
      { title: "Dashboard", page: "dashboard", icon: Home },
    ]

    // Role-specific menu items
    if (userInfo.role === "user") {
      baseItems.push(
        { title: "Input NCP", page: "input-ncp", icon: Plus },
        { title: "NCP Flow Tracker", page: "ncp-flow-tracker", icon: TrendingUp },
        { title: "Database NCP", page: "database-ncp", icon: Database },
      )
    }

    if (userInfo.role === "qa_leader") {
      baseItems.push(
        { title: "Input NCP", page: "input-ncp", icon: Plus },
        { title: "QA Approval", page: "qa-approval", icon: CheckSquare },
        { title: "NCP Flow Tracker", page: "ncp-flow-tracker", icon: TrendingUp },
        { title: "Database NCP", page: "database-ncp", icon: Database },
      )
    }

    if (userInfo.role === "team_leader") {
      baseItems.push(
        { title: "TL Processing", page: "tl-processing", icon: Wrench },
        { title: "NCP Flow Tracker", page: "ncp-flow-tracker", icon: TrendingUp },
        { title: "Database NCP", page: "database-ncp", icon: Database },
      )
    }

    if (userInfo.role === "process_lead") {
      baseItems.push(
        { title: "Process Lead Approval", page: "process-approval", icon: Shield },
        { title: "NCP Flow Tracker", page: "ncp-flow-tracker", icon: TrendingUp },
        { title: "Database NCP", page: "database-ncp", icon: Database },
      )
    }

    if (userInfo.role === "qa_manager") {
      baseItems.push(
        { title: "Manager Approval", page: "manager-approval", icon: Award },
        { title: "NCP Flow Tracker", page: "ncp-flow-tracker", icon: TrendingUp },
        { title: "Database NCP", page: "database-ncp", icon: Database },
      )
    }

    if (userInfo.role === "admin") {
      baseItems.push(
        { title: "Input NCP", page: "input-ncp", icon: Plus },
        { title: "QA Approval", page: "qa-approval", icon: CheckSquare },
        { title: "TL Processing", page: "tl-processing", icon: Wrench },
        { title: "Process Lead Approval", page: "process-approval", icon: Shield },
        { title: "Manager Approval", page: "manager-approval", icon: Award },
        { title: "NCP Flow Tracker", page: "ncp-flow-tracker", icon: TrendingUp },
        { title: "Database NCP", page: "database-ncp", icon: Database },
      )
    }

    if (userInfo.role === "super_admin") {
      baseItems.push(
        { title: "Analytics", page: "analytics", icon: TrendingUp },
        { title: "Audit Log", page: "audit-log", icon: FileText },
        { title: "System Logs", page: "system-logs", icon: Shield },
        { title: "User Management", page: "user-management", icon: Users },
        { title: "API Keys", page: "api-keys", icon: Key },
        { title: "Backup/Restore", page: "backup-restore", icon: Database },
        { title: "Input NCP", page: "input-ncp", icon: Plus },
        { title: "QA Approval", page: "qa-approval", icon: CheckSquare },
        { title: "TL Processing", page: "tl-processing", icon: Wrench },
        { title: "Process Lead Approval", page: "process-approval", icon: Shield },
        { title: "Manager Approval", page: "manager-approval", icon: Award },
        { title: "NCP Flow Tracker", page: "ncp-flow-tracker", icon: TrendingUp },
        { title: "Database NCP", page: "database-ncp", icon: Database },
      )
    }

    return baseItems
  }

  const menuData = {
    ncpGroup: getMenuItems(),
    othersGroup: [
      {
        title: "Inprocess QA Maker",
        page: "qa-maker",
        icon: Users,
        disabled: true,
      },
      {
        title: "Inprocess QA Packer",
        page: "qa-packer",
        icon: Package,
        disabled: true,
      },
      {
        title: "Document Control",
        page: "document-control",
        icon: FileText,
        disabled: true,
      },
    ],
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "qa_leader":
        return "QA LEADER"
      case "team_leader":
        return "TEAM LEADER"
      case "process_lead":
        return "PROCESS LEAD"
      case "qa_manager":
        return "QA MANAGER"
      case "admin":
        return "ADMINISTRATOR"
      case "super_admin":
        return "SUPER ADMINISTRATOR"
      case "user":
        return "QA USER"
      default:
        return "USER"
    }
  }

  return (
    <Sidebar className="border-r-0 glass-panel" {...props}>
      <SidebarHeader className="border-b border-gray-700/30 glass-header">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-black futuristic-heading">QUALITY ASSURANCE</h1>
          <h2 className="text-xl font-bold futuristic-subheading -mt-1">DEPARTMENT</h2>

          {/* User Info */}
          <div className="mt-4 p-3 glass-card rounded-lg">
            <div className="text-sm font-medium text-blue-100">
              {userInfo.fullName || userInfo.username || "Loading..."}
            </div>
            <div className="text-xs text-blue-300">{getRoleDisplayName(userInfo.role)}</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="glass-panel">
        {/* Non Conformance Product Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-300 text-xs font-medium uppercase tracking-wider">
            Non Conformance Product
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.ncpGroup.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={currentPage === item.page}
                    onClick={() => setCurrentPage(item.page)}
                    className="text-blue-200 hover:text-blue-50 hover:bg-blue-500/20 data-[active=true]:bg-blue-600/30 data-[active=true]:text-blue-50 cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Others Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-300 text-xs font-medium uppercase tracking-wider">
            Others
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.othersGroup.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={currentPage === item.page}
                    onClick={() => !item.disabled && setCurrentPage(item.page)}
                    disabled={item.disabled} 
                    className={`text-blue-200 hover:text-blue-50 hover:bg-blue-500/20 data-[active=true]:bg-blue-600/30 data-[active=true]:text-blue-50 cursor-pointer ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      
      <style jsx global>{`
        .glass-header {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(56, 189, 248, 0.1);
        }
      `}</style>
    </Sidebar>
  )
}