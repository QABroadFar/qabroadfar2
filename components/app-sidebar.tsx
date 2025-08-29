"use client"

import type React from "react"

import { Database, CheckCircle, FileInput, Users, Package, FileText, Shield, Settings, UserCog, FileSearch } from "lucide-react"

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
  userRole?: string;
  onNavigationChange?: (component: string) => void;
  activeComponent?: string;
}

// Menu data
const menuData = {
  ncpGroup: [
    {
      title: "Dashboard",
      component: "dashboard",
      icon: CheckCircle,
    },
    {
      title: "Input NCP",
      component: "input",
      icon: FileInput,
    },
    {
      title: "Database NCP",
      component: "database",
      icon: Database,
    },
  ],
  superAdminGroup: [
    {
      title: "User Management",
      component: "users",
      icon: UserCog,
    },
    {
      title: "Audit Logs",
      component: "audit",
      icon: FileSearch,
    },
    {
      title: "System Settings",
      component: "settings",
      icon: Settings,
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

export function AppSidebar({ userRole, onNavigationChange, activeComponent, ...props }: AppSidebarProps) {
  const handleNavigation = (component: string) => {
    if (onNavigationChange) {
      onNavigationChange(component);
    }
  };

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
                    onClick={() => handleNavigation(item.component)}
                    isActive={activeComponent === item.component}
                    className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-blue-600 data-[active=true]:text-white"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Super Admin Group - Only visible to super admins */}
        {userRole === "super_admin" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-300 text-xs font-medium uppercase tracking-wider">
              Super Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuData.superAdminGroup.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.component)}
                      isActive={activeComponent === item.component}
                      className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-blue-600 data-[active=true]:text-white"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

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
