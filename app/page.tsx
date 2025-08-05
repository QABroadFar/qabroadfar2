"use client"

import { useState } from "react"
import LoginPage from "./login/page"
import DashboardPage from "./dashboard/page"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <DashboardPage onLogout={handleLogout} />
}
