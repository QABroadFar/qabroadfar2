"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  Loader2, 
  TrendingUp, 
  FileText, 
  Calendar, 
  User, 
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"

interface NCPStats {
  total: number
  pending: number
  qaApproved: number
  tlProcessed: number
  rejected: number
}

interface MonthlyNCPData {
  month: string
  count: number
}

interface StatusDistribution {
  name: string
  value: number
}

interface TopSubmitter {
  submitted_by: string
  count: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function AnalyticsDashboard() {
  const [ncpStats, setNcpStats] = useState<NCPStats | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyNCPData[]>([])
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([])
  const [topSubmitters, setTopSubmitters] = useState<TopSubmitter[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("last_12_months")

  // Mock data initialization
  useEffect(() => {
    // In a real implementation, this would fetch from API
    setTimeout(() => {
      setNcpStats({
        total: 1247,
        pending: 23,
        qaApproved: 342,
        tlProcessed: 412,
        rejected: 34
      })
      
      setMonthlyData([
        { month: "Jan 2023", count: 98 },
        { month: "Feb 2023", count: 102 },
        { month: "Mar 2023", count: 115 },
        { month: "Apr 2023", count: 95 },
        { month: "May 2023", count: 108 },
        { month: "Jun 2023", count: 120 },
        { month: "Jul 2023", count: 112 },
        { month: "Aug 2023", count: 105 },
        { month: "Sep 2023", count: 98 },
        { month: "Oct 2023", count: 102 },
        { month: "Nov 2023", count: 110 },
        { month: "Dec 2023", count: 125 }
      ])
      
      setStatusDistribution([
        { name: "Pending QA Review", value: 23 },
        { name: "Team Leader Assigned", value: 342 },
        { name: "Processing Complete", value: 412 },
        { name: "Process Approved", value: 210 },
        { name: "Completed", value: 226 },
        { name: "Rejected", value: 34 }
      ])
      
      setTopSubmitters([
        { submitted_by: "john_doe", count: 142 },
        { submitted_by: "jane_smith", count: 138 },
        { submitted_by: "mike_johnson", count: 125 },
        { submitted_by: "sarah_williams", count: 118 },
        { submitted_by: "david_brown", count: 109 }
      ])
      
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading analytics data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into NCP reports and system usage</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="last_12_months">Last 12 Months</option>
          </select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total NCPs</p>
                <p className="text-2xl font-bold text-blue-900">{ncpStats?.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-900">{ncpStats?.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">In Progress</p>
                <p className="text-2xl font-bold text-green-900">{ncpStats?.qaApproved + ncpStats?.tlProcessed}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Completed</p>
                <p className="text-2xl font-bold text-purple-900">{ncpStats?.tlProcessed + 210 + 226}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Rejected</p>
                <p className="text-2xl font-bold text-red-900">{ncpStats?.rejected}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly NCP Reports Chart */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              NCP Reports Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="NCP Reports" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Chart */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              NCP Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Submitters */}
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Top NCP Submitters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">NCPs Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Rank</th>
                </tr>
              </thead>
              <tbody>
                {topSubmitters.map((submitter, index) => (
                  <tr key={submitter.submitted_by} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{submitter.submitted_by}</td>
                    <td className="py-3 px-4">{submitter.count}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="font-bold text-lg mr-2">#{index + 1}</span>
                        {index === 0 && <span className="text-yellow-500">🏆</span>}
                        {index === 1 && <span className="text-gray-400">🥈</span>}
                        {index === 2 && <span className="text-amber-700">🥉</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}