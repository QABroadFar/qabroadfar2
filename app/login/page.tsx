"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Shield, Lock, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Login berhasil, redirect berdasarkan role
        if (data.user.role === "super_admin") {
          router.push("/superadmin/dashboard")
        } else {
          router.push("/dashboard")
        }
      } else {
        setError(data.error || "Login gagal. Silakan coba lagi.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublicAccess = () => {
    router.push("/public/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 overflow-hidden">
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
        className="w-full max-w-md z-10"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 pointer-events-none"></div>
            <CardHeader className="space-y-1 pb-8 pt-8 relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center mb-4"
              >
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold text-center text-white">
                Quality Assurance Portal
              </CardTitle>
              <p className="text-center text-blue-200">
                Secure access to NCP management system
              </p>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center space-x-2 text-red-300 bg-red-900/30 p-3 rounded-lg border border-red-500/30"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-blue-200">
                    Username
                  </Label>
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileFocusWithin={{ scale: 1.02 }}
                      className="transition-all duration-300"
                    >
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        className="h-12 bg-white/10 border border-white/20 text-white placeholder:text-blue-200/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 rounded-xl pl-12"
                        required
                        disabled={isLoading}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <div className="h-4 w-4 bg-blue-400 rounded-full"></div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-blue-200">
                    Password
                  </Label>
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileFocusWithin={{ scale: 1.02 }}
                      className="transition-all duration-300"
                    >
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-12 bg-white/10 border border-white/20 text-white placeholder:text-blue-200/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 rounded-xl pl-12 pr-12"
                        required
                        disabled={isLoading}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Lock className="h-4 w-4 text-purple-400" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </motion.div>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      "Secure Login"
                    )}
                  </Button>
                </motion.div>
              </form>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-blue-300">Or continue with</span>
                </div>
              </div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handlePublicAccess}
                  variant="outline"
                  className="w-full h-12 border border-white/30 bg-white/10 text-white font-medium text-base transition-all duration-300 rounded-xl hover:bg-white/20 hover:border-white/50"
                >
                  <Shield className="mr-2 h-5 w-5 text-blue-300" />
                  Public Dashboard Access
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-blue-300/70 text-sm mt-6"
        >
          <p>© 2025 Quality Assurance Portal. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}