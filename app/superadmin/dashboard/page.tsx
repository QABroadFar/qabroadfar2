"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, FileText, CheckCircle, Clock, XCircle } from "lucide-react"

export default function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalNCPReports: 0,
      pendingReports: 0,
      approvedReports: 0,
      rejectedReports: 0
    },
    monthlyReports: [],
    statusDistribution: [],
    topSubmitters: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard")
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const statusColors = {
    pending: "#f59e0b",
    qa_approved: "#3b82f6",
    tl_processed: "#8b5cf6",
    process_approved: "#ec4899",
    manager_approved: "#10b981",
    qa_rejected: "#ef4444",
    process_rejected: "#ef4444"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
          <p className="text-gray-600">Overview of system activities and metrics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total NCP Reports</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalNCPReports}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.pendingReports}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Reports</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.approvedReports}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Reports</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.rejectedReports}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Reports Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
            <CardHeader>
              <CardTitle>NCP Reports by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.monthlyReports}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Reports" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
            <CardHeader>
              <CardTitle>NCP Report Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.status] || "#8884d8"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Submitters */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
          <CardHeader>
            <CardTitle>Top NCP Submitters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.topSubmitters}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="submitted_by" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Reports Submitted" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}