"use client"

import type React from "react"

import { Database, CheckCircle, FileInput, Users, Package, FileText } from "lucide-react"

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

// Menu data
const menuData = {
  ncpGroup: [
    {
      title: "Input NCP",
      url: "/input-ncp",
      icon: FileInput,
      isActive: false,
    },
    {
      title: "Approval NCP",
      url: "/approval-ncp",
      icon: CheckCircle,
      isActive: true,
    },
    {
      title: "Database NCP",
      url: "/database-ncp",
      icon: Database,
      isActive: false,
    },
  ],
  othersGroup: [
    {
      title: "Inprocess QA Maker",
      url: "#",
      icon: Users,
      disabled: true,
    },
    {
      title: "Inprocess QA Packer",
      url: "#",
      icon: Package,
      disabled: true,
    },
    {
      title: "Document Control",
      url: "#",
      icon: FileText,
      disabled: true,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="border-b border-gray-200/20 bg-white/95 backdrop-blur-sm">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight font-sans">QUALITY ASSURANCE</h1>
          <h2 className="text-xl font-bold text-gray-700 -mt-1 tracking-wide font-sans">DEPARTMENT</h2>
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
                    asChild
                    isActive={item.isActive}
                    className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-blue-600 data-[active=true]:text-white"
                  >
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
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
