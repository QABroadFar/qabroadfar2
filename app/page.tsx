"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page by default
    router.push("/login")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Redirecting...</div>
    </div>
  )
}
