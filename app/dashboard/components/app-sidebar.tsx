"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Database, CheckCircle, FileInput, Users, Package, FileText, Settings, Cog, Award } from "lucide-react"

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
      {
        title: "Input NCP",
        page: "input-ncp",
        icon: FileInput,
        roles: ["user", "qa_leader", "admin"],
      },
      {
        title: "Database NCP",
        page: "database-ncp",
        icon: Database,
        roles: ["user", "qa_leader", "team_leader", "process_lead", "qa_manager", "admin"],
      },
    ]

    const roleSpecificItems = []

    if (userInfo.role === "qa_leader" || userInfo.role === "admin") {
      roleSpecificItems.push({
        title: "QA Leader Approval",
        page: "qa-approval",
        icon: CheckCircle,
        roles: ["qa_leader", "admin"],
      })
    }

    if (userInfo.role === "team_leader" || userInfo.role === "admin") {
      roleSpecificItems.push({
        title: "Team Leader Processing",
        page: "tl-processing",
        icon: Settings,
        roles: ["team_leader", "admin"],
      })
    }

    if (userInfo.role === "process_lead" || userInfo.role === "admin") {
      roleSpecificItems.push({
        title: "Process Lead Approval",
        page: "process-approval",
        icon: Cog,
        roles: ["process_lead", "admin"],
      })
    }

    if (userInfo.role === "qa_manager" || userInfo.role === "admin") {
      roleSpecificItems.push({
        title: "QA Manager Approval",
        page: "qa-manager-approval",
        icon: Award,
        roles: ["qa_manager", "admin"],
      })
    }

    return [...baseItems, ...roleSpecificItems]
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
      case "user":
        return "QA USER"
      default:
        return "USER"
    }
  }

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="border-b border-gray-200/20 bg-white/95 backdrop-blur-sm">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight font-sans">QUALITY ASSURANCE</h1>
          <h2 className="text-xl font-bold text-gray-700 -mt-1 tracking-wide font-sans">DEPARTMENT</h2>

          {/* User Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-800">
              {userInfo.fullName || userInfo.username || "Loading..."}
            </div>
            <div className="text-xs text-blue-600">{getRoleDisplayName(userInfo.role)}</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gray-900/95 backdrop-blur-sm">
        {/* Non Conformance Product Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 text-xs font-medium uppercase tracking-wider">
            Non Conformance Product
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.ncpGroup.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={currentPage === item.page}
                    onClick={() => setCurrentPage(item.page)}
                    className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-blue-600 data-[active=true]:text-white cursor-pointer"
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
          <SidebarGroupLabel className="text-gray-300 text-xs font-medium uppercase tracking-wider">
            Others
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.othersGroup.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton disabled={item.disabled} className="text-gray-500 cursor-not-allowed opacity-50">
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
    </Sidebar>
  )
}
