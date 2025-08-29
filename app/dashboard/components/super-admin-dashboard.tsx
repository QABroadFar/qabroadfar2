"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp
} from "lucide-react"

interface DashboardStats {
  total_ncps: number
  pending_approval: number
  completed_today: number
  rejected_this_week: number
  active_users: number
  avg_resolution_time: number
}

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, this would fetch from API
    setTimeout(() => {
      setStats({
        total_ncps: 1247,
        pending_approval: 23,
        completed_today: 12,
        rejected_this_week: 3,
        active_users: 42,
        avg_resolution_time: 2.5 // hours
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total NCPs */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total NCPs</p>
                <p className="text-3xl font-bold text-blue-900">{stats?.total_ncps}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500" />
            </div>
            <p className="text-xs text-blue-600 mt-2">All NCP reports in the system</p>
          </CardContent>
        </Card>

        {/* Pending Approval */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-900">{stats?.pending_approval}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
            <p className="text-xs text-yellow-600 mt-2">Reports awaiting review</p>
          </CardContent>
        </Card>

        {/* Completed Today */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Completed Today</p>
                <p className="text-3xl font-bold text-green-900">{stats?.completed_today}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">Reports finalized today</p>
          </CardContent>
        </Card>

        {/* Rejected This Week */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Rejected This Week</p>
                <p className="text-3xl font-bold text-red-900">{stats?.rejected_this_week}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <p className="text-xs text-red-600 mt-2">Reports sent back for corrections</p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Active Users</p>
                <p className="text-3xl font-bold text-purple-900">{stats?.active_users}</p>
              </div>
              <Users className="h-10 w-10 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 mt-2">Users active in the last 30 days</p>
          </CardContent>
        </Card>

        {/* Avg Resolution Time */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700">Avg Resolution Time</p>
                <p className="text-3xl font-bold text-indigo-900">{stats?.avg_resolution_time}h</p>
              </div>
              <TrendingUp className="h-10 w-10 text-indigo-500" />
            </div>
            <p className="text-xs text-indigo-600 mt-2">Average time to complete reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="mr-3 p-2 bg-blue-100 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">New user registered</p>
                  <p className="text-sm text-gray-600">User "new_qa_user" was added to the system</p>
                </div>
                <div className="ml-auto text-sm text-gray-500">2 hours ago</div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="mr-3 p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">NCP report approved</p>
                  <p className="text-sm text-gray-600">Report 2305-0042 was approved by QA Manager</p>
                </div>
                <div className="ml-auto text-sm text-gray-500">5 hours ago</div>
              </div>
              
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <div className="mr-3 p-2 bg-yellow-100 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Report status changed</p>
                  <p className="text-sm text-gray-600">Report 2305-0038 was reverted to pending by Super Admin</p>
                </div>
                <div className="ml-auto text-sm text-gray-500">1 day ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}