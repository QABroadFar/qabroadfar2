"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, TrendingUp, Users, FileText, Clock, AlertCircle } from "lucide-react"
import { NCPTracker } from "@/components/ncp-tracker"

export function WelcomeContent() {
  const [ncpReports, setNcpReports] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  })

  useEffect(() => {
    fetchNCPReports()
    fetchStats()
  }, [])

  const fetchNCPReports = async () => {
    try {
      const response = await fetch("/api/ncp/list")
      if (response.ok) {
        const data = await response.json()
        setNcpReports(data.slice(0, 5)) // Show only first 5 for the dashboard
      }
    } catch (error) {
      console.error("Error fetching NCP reports:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to Quality Assurance Portal</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage non-conformance products, track quality processes, and maintain excellence in your operations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total NCPs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NCP Tracker */}
      <NCPTracker ncpReports={ncpReports} />

      {/* Quick Actions */}
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/input-ncp" className="p-4 bg-blue-50/80 rounded-lg hover:bg-blue-100/80 transition-colors cursor-pointer block">
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-800">Create New NCP</h4>
              <p className="text-sm text-gray-600">Start a new non-conformance report</p>
            </a>
            <a href="/approval-ncp" className="p-4 bg-green-50/80 rounded-lg hover:bg-green-100/80 transition-colors cursor-pointer block">
              <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-800">Review Pending</h4>
              <p className="text-sm text-gray-600">Review items awaiting approval</p>
            </a>
            <a href="/database-ncp" className="p-4 bg-purple-50/80 rounded-lg hover:bg-purple-100/80 transition-colors cursor-pointer block">
              <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-800">View Reports</h4>
              <p className="text-sm text-gray-600">Access quality reports and analytics</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
