"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const user = await response.json()
          setIsLoggedIn(true)
          // Redirect based on user role
          if (user.role === "super_admin") {
            router.push("/superadmin/dashboard")
          } else {
            router.push("/dashboard")
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
      }
    }

    checkAuth()
  }, [router])

  const handleLogin = () => {
    router.push("/login")
  }

  const handlePublicAccess = () => {
    router.push("/public/dashboard")
  }

  // If user is logged in, we'll redirect them, so we don't need to show anything
  if (isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Redirecting...</h1>
          <p className="text-gray-600 mt-2">Please wait while we redirect you to your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">Quality Assurance Portal</CardTitle>
          <CardDescription className="text-lg">
            Non-Conformance Product Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Welcome to our Quality Assurance Portal. This system helps manage Non-Conformance Product (NCP) reports 
              through a structured workflow process with multiple approval stages.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleLogin}
              className="h-14 text-lg"
            >
              Login to Your Account
            </Button>
            
            <Button
              onClick={handlePublicAccess}
              variant="outline"
              className="h-14 text-lg border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              View Public Dashboard
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-8">
            <p>For authorized users only. Public access is read-only.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}