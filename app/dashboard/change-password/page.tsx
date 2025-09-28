"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { DashboardHeader } from "../components/dashboard-header";
import { ChangePasswordForm } from "@/components/change-password-form";

interface UserInfo {
  id: number;
  username: string;
  role: string;
  fullName?: string;
}

export default function ChangePasswordPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentPage, setCurrentPage] = useState("change-password");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data.user);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar userInfo={userInfo} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <SidebarInset>
        <DashboardHeader 
          onLogout={handleLogout} 
          setCurrentPage={setCurrentPage}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="max-w-2xl mx-auto w-full py-6">
            <ChangePasswordForm 
              userId={userInfo.id} 
              username={userInfo.username} 
              onBack={() => {
                // Update the current page to dashboard
                setCurrentPage("dashboard");
                // Also update the URL to reflect the change
                router.push('/dashboard');
              }} 
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}