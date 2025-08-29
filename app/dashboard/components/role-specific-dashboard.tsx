"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts"
import { 
  CheckCircle, Clock, XCircle, FileText, TrendingUp, Users, 
  Package, User, Calendar, BarChart3, PieChartIcon 
} from "lucide-react"
import { formatToWIBID, formatDateOnlyWIB } from "@/lib/date-utils"
import { SuperAdminDashboard } from "./super-admin-dashboard"

interface DashboardStats {
  total: number
  pending: number
  approved: number
  processed: number
  qaApproved?: number
  tlProcessed?: number
  process_approved?: number
  manager_approved?: number
  rejected?: number
}

interface ChartData {
  monthly: { month: string; count: number }[]
  statusDistribution: { status: string; count: number }[]
  topSubmitters: { submitted_by: string; count: number }[]
}

interface NCPReport {
  id: number
  ncp_id: string
  sku_code: string
  machine_code: string
  date: string
  status: string
  submitted_by: string
  submitted_at: string
  qa_approved_at?: string
  tl_processed_at?: string
  process_approved_at?: string
  manager_approved_at?: string
}

interface UserInfo {
  id: number
  username: string
  role: string
  fullName?: string
}

interface DashboardData {
  stats: DashboardStats
  charts: ChartData
  teamLeaders: any[]
}

export function RoleSpecificDashboard({ userInfo }: { userInfo: UserInfo }) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [userNCPs, setUserNCPs] = useState<NCPReport[]>([])
  const [pendingNCPs, setPendingNCPs] = useState<NCPReport[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch dashboard statistics
      const statsResponse = await fetch("/api/dashboard/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setDashboardData(statsData.data)
      }

      // Fetch user's NCPs
      const ncpsResponse = await fetch("/api/dashboard/ncps")
      if (ncpsResponse.ok) {
        const ncpsData = await ncpsResponse.json()
        setUserNCPs(ncpsData.data)
      }

      // Fetch pending NCPs (for approvers)
      const pendingResponse = await fetch("/api/dashboard/ncps?type=pending")
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingNCPs(pendingData.data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      qa_approved: { label: "QA Approved", className: "bg-blue-100 text-blue-800" },
      tl_processed: { label: "TL Processed", className: "bg-purple-100 text-purple-800" },
      process_approved: { label: "Process Approved", className: "bg-indigo-100 text-indigo-800" },
      manager_approved: { label: "Manager Approved", className: "bg-green-100 text-green-800" },
      qa_rejected: { label: "QA Rejected", className: "bg-red-100 text-red-800" },
      process_rejected: { label: "Process Rejected", className: "bg-red-100 text-red-800" },
      manager_rejected: { label: "Manager Rejected", className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-100 text-gray-800" }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getStatusStats = () => {
    if (!dashboardData) return []
    
    const stats = dashboardData.stats
    return [
      { name: "Pending", value: stats.pending || 0, color: "#f59e0b" },
      { name: "QA Approved", value: stats.qaApproved || 0, color: "#3b82f6" },
      { name: "TL Processed", value: stats.tlProcessed || 0, color: "#8b5cf6" },
      { name: "Process Approved", value: stats.process_approved || 0, color: "#6366f1" },
      { name: "Manager Approved", value: stats.manager_approved || 0, color: "#10b981" },
      { name: "Rejected", value: stats.rejected || 0, color: "#ef4444" },
    ]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  // Role-specific dashboard views
  const renderRoleDashboard = () => {
    switch (userInfo.role) {
      case "user":
        return renderUserDashboard()
      case "qa_leader":
        return renderQALeaderDashboard()
      case "team_leader":
        return renderTeamLeaderDashboard()
      case "process_lead":
        return renderProcessLeadDashboard()
      case "qa_manager":
        return renderQAManagerDashboard()
      case "admin":
      case "super_admin":
        return renderAdminDashboard()
      default:
        return renderDefaultDashboard()
    }
  }

  const renderUserDashboard = () => {
    const userReports = userNCPs.slice(0, 5) // Show only 5 most recent
    const rejectedReports = userNCPs.filter(ncp => ncp.status.includes("rejected")).slice(0, 5)
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.total || 0}</div>
              <p className="text-xs text-muted-foreground">Reports you've submitted</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.pending || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.approved || 0}</div>
              <p className="text-xs text-muted-foreground">Fully approved</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userReports.length > 0 ? (
                <div className="space-y-4">
                  {userReports.map((ncp) => (
                    <div key={ncp.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <div className="font-medium">{ncp.ncp_id}</div>
                        <div className="text-sm text-muted-foreground">
                          {ncp.sku_code} • {formatDateOnlyWIB(ncp.date)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ncp.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reports found</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Rejected Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rejectedReports.length > 0 ? (
                <div className="space-y-4">
                  {rejectedReports.map((ncp) => (
                    <div key={ncp.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <div className="font-medium">{ncp.ncp_id}</div>
                        <div className="text-sm text-muted-foreground">
                          {ncp.sku_code} • {formatDateOnlyWIB(ncp.date)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ncp.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No rejected reports</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderQALeaderDashboard = () => {
    const pendingApprovals = Array.isArray(pendingNCPs) ? pendingNCPs.slice(0, 5) : []
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.pending || 0}</div>
              <p className="text-xs text-muted-foreground">Reports awaiting your approval</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Approved in last 24 hours</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.qaApproved || 0}</div>
              <p className="text-xs text-muted-foreground">Reports you've approved</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5h</div>
              <p className="text-xs text-muted-foreground">Avg. approval time</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((ncp) => (
                  <div key={ncp.id} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium">{ncp.ncp_id}</div>
                      <div className="text-sm text-muted-foreground">
                        {ncp.sku_code} • Machine: {ncp.machine_code}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Submitted: {formatToWIBID(ncp.submitted_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(ncp.status)}
                      <Button size="sm">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending approvals</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderTeamLeaderDashboard = () => {
    const assignedNCPs = pendingNCPs.filter(ncp => ncp.status === "qa_approved").slice(0, 5)
    const processedNCPs = pendingNCPs.filter(ncp => ncp.status === "tl_processed").slice(0, 5)
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned for RCA</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedNCPs.length}</div>
              <p className="text-xs text-muted-foreground">Pending root cause analysis</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processedNCPs.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting process lead review</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2h</div>
              <p className="text-xs text-muted-foreground">Average time to complete RCA</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Awaiting RCA Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedNCPs.length > 0 ? (
                <div className="space-y-4">
                  {assignedNCPs.map((ncp) => (
                    <div key={ncp.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <div className="font-medium">{ncp.ncp_id}</div>
                        <div className="text-sm text-muted-foreground">
                          {ncp.sku_code} • {formatDateOnlyWIB(ncp.date)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm">Process</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No NCPs assigned for RCA</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Processed NCPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processedNCPs.length > 0 ? (
                <div className="space-y-4">
                  {processedNCPs.map((ncp) => (
                    <div key={ncp.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <div className="font-medium">{ncp.ncp_id}</div>
                        <div className="text-sm text-muted-foreground">
                          {ncp.sku_code} • Processed: {formatToWIBID(ncp.tl_processed_at || '')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ncp.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No processed NCPs</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderProcessLeadDashboard = () => {
    const pendingReviews = pendingNCPs.filter(ncp => ncp.status === "tl_processed").slice(0, 5)
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReviews.length}</div>
              <p className="text-xs text-muted-foreground">Reports awaiting your review</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.process_approved || 0}</div>
              <p className="text-xs text-muted-foreground">Reports you've approved</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Review Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.8h</div>
              <p className="text-xs text-muted-foreground">Average time to review</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending Process Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingReviews.length > 0 ? (
              <div className="space-y-4">
                {pendingReviews.map((ncp) => (
                  <div key={ncp.id} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium">{ncp.ncp_id}</div>
                      <div className="text-sm text-muted-foreground">
                        {ncp.sku_code} • Machine: {ncp.machine_code}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Processed: {formatToWIBID(ncp.tl_processed_at || '')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(ncp.status)}
                      <Button size="sm">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending reviews</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderQAManagerDashboard = () => {
    const pendingApprovals = pendingNCPs.filter(ncp => ncp.status === "process_approved").slice(0, 5)
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovals.length}</div>
              <p className="text-xs text-muted-foreground">Reports awaiting final approval</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Final approvals this month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.manager_approved || 0}</div>
              <p className="text-xs text-muted-foreground">Reports you've approved</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Pending Final Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((ncp) => (
                  <div key={ncp.id} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium">{ncp.ncp_id}</div>
                      <div className="text-sm text-muted-foreground">
                        {ncp.sku_code} • Machine: {ncp.machine_code}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Process Approved: {formatToWIBID(ncp.process_approved_at || '')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(ncp.status)}
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending approvals</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderAdminDashboard = () => {
    if (userInfo.role === "super_admin") {
      return <SuperAdminDashboard />
    }
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total NCPs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.total || 0}</div>
              <p className="text-xs text-muted-foreground">All non-conformance reports</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.pending || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboardData?.stats.qaApproved || 0) + (dashboardData?.stats.tlProcessed || 0) + (dashboardData?.stats.process_approved || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Being processed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.manager_approved || 0}</div>
              <p className="text-xs text-muted-foreground">Fully approved reports</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.rejected || 0}</div>
              <p className="text-xs text-muted-foreground">Rejected reports</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                NCPs by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.charts.monthly && dashboardData.charts.monthly.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.charts.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="NCP Count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                NCP Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusStats().filter(item => item.value > 0).length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getStatusStats().filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getStatusStats().filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Count"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Submitters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.charts.topSubmitters && dashboardData.charts.topSubmitters.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.charts.topSubmitters.map((submitter, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="font-medium">{submitter.submitted_by}</div>
                      <div className="text-lg font-bold text-blue-600">{submitter.count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Recent system activity will be shown here</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderDefaultDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">Welcome to Quality Assurance Portal</h2>
          <p className="text-gray-600 mt-2">Your dashboard will be customized based on your role.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userInfo.fullName || userInfo.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData}>
            Refresh Data
          </Button>
        </div>
      </div>

      {renderRoleDashboard()}
    </div>
  )
}