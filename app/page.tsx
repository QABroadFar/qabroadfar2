"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Shield, Eye, Users, BarChart3, Zap, Globe } from "lucide-react"

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Redirecting...</h1>
          <p className="text-blue-200 mt-2">Please wait while we redirect you to your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl z-10"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-0 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 pointer-events-none"></div>
            <CardHeader className="space-y-6 pb-6 pt-10 text-center relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center"
              >
                <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                  <Shield className="h-16 w-16 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-4xl md:text-5xl font-bold text-white">
                Quality Assurance Portal
              </CardTitle>
              <CardDescription className="text-xl text-blue-200 max-w-2xl mx-auto">
                Advanced Non-Conformance Product Management System
              </CardDescription>
              <p className="text-blue-300 max-w-3xl mx-auto">
                Streamline your quality assurance processes with our cutting-edge platform designed for modern manufacturing environments.
              </p>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <Card className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <Users className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Role-Based Access</h3>
                    <p className="text-blue-200 text-sm">
                      Secure access control for different user roles and responsibilities
                    </p>
                  </div>
                </Card>
                
                <Card className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <BarChart3 className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Real-Time Analytics</h3>
                    <p className="text-blue-200 text-sm">
                      Live dashboards with comprehensive reporting and insights
                    </p>
                  </div>
                </Card>
                
                <Card className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                      <Zap className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Workflow Automation</h3>
                    <p className="text-blue-200 text-sm">
                      Streamlined approval processes with automated notifications
                    </p>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleLogin}
                    className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white text-lg font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Shield className="mr-3 h-6 w-6" />
                    Login to Your Account
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handlePublicAccess}
                    variant="outline"
                    className="w-full h-16 border-2 border-white/30 bg-white/10 text-white text-lg font-semibold rounded-2xl hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                  >
                    <Eye className="mr-3 h-6 w-6 text-blue-300" />
                    View Public Dashboard
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="text-center text-blue-300/70 text-sm"
              >
                <p>For authorized users only. Public access is read-only.</p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-center text-blue-300/70 text-sm mt-8"
        >
          <p>© 2025 Quality Assurance Portal. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}