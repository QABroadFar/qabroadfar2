"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Package2, Users, FileText, Settings, Shield, BarChart3, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      
      if (response.ok) {
        window.location.href = "/login"
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

  const navItems = [
    {
      title: "Dashboard",
      href: "/superadmin/dashboard",
      icon: BarChart3,
    },
    {
      title: "User Management",
      href: "/superadmin/user-management",
      icon: Users,
    },
    {
      title: "NCP Management",
      href: "/superadmin/ncp-management",
      icon: FileText,
    },
    {
      title: "Workflow Intervention",
      href: "/superadmin/workflow-intervention",
      icon: Shield,
    },
    {
      title: "System Configuration",
      href: "/superadmin/system-configuration",
      icon: Settings,
    },
    {
      title: "Audit Logs",
      href: "/superadmin/audit-logs",
      icon: FileText,
    },
    {
      title: "System Settings",
      href: "/superadmin/settings",
      icon: Settings,
    },
  ]

  const isActive = (path) => {
    return pathname === path
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden absolute top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-64 flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/superadmin/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsOpen(false)}
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Quality Assurance Portal</span>
            </Link>
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    isActive(item.href)
                      ? "bg-muted text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-10 w-64 border-r bg-background">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            <Link href="/superadmin/dashboard" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">QA Portal</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      isActive(item.href)
                        ? "bg-muted text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:ml-64">
        {/* Mobile Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="sr-only">Quality Assurance Portal</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}