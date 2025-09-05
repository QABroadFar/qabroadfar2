"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-3xl font-bold text-center text-gray-800">User Login</CardTitle>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Masukkan username Anda"
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Masukkan password Anda"
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
            
            <Button
              onClick={handlePublicAccess}
              variant="outline"
              className="w-full h-12 border-gray-300 text-gray-700 font-medium text-base transition-colors hover:bg-gray-50"
            >
              View Public Dashboard
            </Button>
            
            <div className="text-center text-sm text-gray-500 mt-6">
              <p className="mb-2">Akun yang tersedia:</p>
              <div className="text-xs space-y-1">
                <p><strong>user1</strong> / 123 (User)</p>
                <p><strong>qaleader1</strong> / 123 (QA Leader)</p>
                <p><strong>teamlead1</strong> / 123 (Team Leader)</p>
                <p><strong>processlead1</strong> / 123 (Process Lead)</p>
                <p><strong>qamanager1</strong> / 123 (QA Manager)</p>
                <p><strong>admin</strong> / 123 (Admin)</p>
                <p><strong>q</strong> / q (Quick Admin)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}