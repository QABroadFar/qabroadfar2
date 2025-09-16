"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, FileText, CheckCircle, Clock, XCircle, TrendingUp, Package } from "lucide-react"

export default function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalNCPReports: 0,
      pendingReports: 0,
      approvedReports: 0,
      rejectedReports: 0
    },
    monthlyReports: [] as { month: string; count: number }[],
    statusDistribution: [] as { status: string; count: number }[],
    topSubmitters: [] as { submitted_by: string; count: number }[]
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

  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    qa_approved: "#3b82f6",
    tl_processed: "#8b5cf6",
    process_approved: "#ec4899",
    manager_approved: "#10b981",
    qa_rejected: "#ef4444",
    process_rejected: "#ef4444"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold futuristic-heading">Super Admin Dashboard</h1>
          <p className="text-blue-300">Overview of system activities and metrics</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm futuristic-subheading">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold futuristic-heading">{dashboardData.stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm futuristic-subheading">Total NCP Reports</CardTitle>
            <FileText className="h-4 w-4 text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold futuristic-heading">{dashboardData.stats.totalNCPReports}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm futuristic-subheading">Pending Reports</CardTitle>
            <Clock className="h-4 w-4 text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold futuristic-heading">{dashboardData.stats.pendingReports}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm futuristic-subheading">Approved Reports</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold futuristic-heading">{dashboardData.stats.approvedReports}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm futuristic-subheading">Rejected Reports</CardTitle>
            <XCircle className="h-4 w-4 text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold futuristic-heading">{dashboardData.stats.rejectedReports}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Reports Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 futuristic-subheading">
              <TrendingUp className="h-5 w-5 text-blue-300" />
              NCP Reports by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.monthlyReports}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      borderColor: 'rgba(56, 189, 248, 0.3)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '0.5rem'
                    }} 
                    itemStyle={{ color: '#e0f2fe' }}
                  />
                  <Legend 
                    formatter={(value) => <span className="text-blue-200">{value}</span>}
                  />
                  <Bar dataKey="count" name="Reports" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 futuristic-subheading">
              <PieChart className="h-5 w-5 text-blue-300" />
              NCP Report Status Distribution
            </CardTitle>
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
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      borderColor: 'rgba(56, 189, 248, 0.3)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '0.5rem'
                    }} 
                    itemStyle={{ color: '#e0f2fe' }}
                    formatter={(value) => [value, "Count"]}
                  />
                  <Legend 
                    formatter={(value) => <span className="text-blue-200">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Submitters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 futuristic-subheading">
            <Users className="h-5 w-5 text-blue-300" />
            Top NCP Submitters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.topSubmitters}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="submitted_by" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0.5rem'
                  }} 
                  itemStyle={{ color: '#e0f2fe' }}
                />
                <Legend 
                  formatter={(value) => <span className="text-blue-200">{value}</span>}
                />
                <Bar dataKey="count" name="Reports Submitted" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}