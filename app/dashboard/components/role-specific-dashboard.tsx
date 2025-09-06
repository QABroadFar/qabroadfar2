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
import { formatToWIB, formatDateOnlyWIB, formatSubmissionDate } from "@/lib/date-utils"
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
        const data = await statsResponse.json()
        // Ensure we're setting the correct data structure
        if (data && typeof data === 'object') {
          setDashboardData(prev => {
            if (!prev) {
              return {
                stats: data.stats || data,
                charts: data.charts || { monthly: [], statusDistribution: [], topSubmitters: [] },
                teamLeaders: []
              }
            }
            return {
              ...prev,
              stats: data.stats || data,
              charts: data.charts || { monthly: [], statusDistribution: [], topSubmitters: [] }
            }
          })
        }
      }

      // Fetch user's NCPs
      const ncpsResponse = await fetch("/api/dashboard/ncps")
      if (ncpsResponse.ok) {
        const data = await ncpsResponse.json()
        // Ensure data.data is an array
        setUserNCPs(Array.isArray(data.data) ? data.data : [])
      }

      // Fetch pending NCPs (for approvers)
      const pendingResponse = await fetch("/api/dashboard/ncps?type=pending")
      if (pendingResponse.ok) {
        const data = await pendingResponse.json()
        // Ensure data.data is an array
        setPendingNCPs(Array.isArray(data.data) ? data.data : [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", className: "status-badge-pending" },
      qa_approved: { label: "QA Approved", className: "status-badge-qa-approved" },
      tl_processed: { label: "TL Processed", className: "status-badge-tl-processed" },
      process_approved: { label: "Process Approved", className: "status-badge-process-approved" },
      manager_approved: { label: "Completed", className: "status-badge-manager-approved" },
      qa_rejected: { label: "QA Rejected", className: "status-badge-rejected" },
      process_rejected: { label: "Process Rejected", className: "status-badge-rejected" },
      manager_rejected: { label: "Manager Rejected", className: "status-badge-rejected" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "bg-gray-100 text-gray-800" }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getStatusStats = () => {
    if (!dashboardData || !dashboardData.stats) return []
    
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
        <div className="text-lg text-blue-200">Loading dashboard...</div>
      </div>
    )
  }

  // Role-specific dashboard views
  const renderRoleDashboard = () => {
    // Ensure userInfo exists and has a role
    if (!userInfo || !userInfo.role) {
      return renderDefaultDashboard()
    }
    
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
    // Ensure userNCPs is an array before using array methods
    const safeUserNCPs = Array.isArray(userNCPs) ? userNCPs : []
    const userReports = safeUserNCPs.slice(0, 5) // Show only 5 most recent
    const rejectedReports = safeUserNCPs.filter(ncp => ncp.status.includes("rejected")).slice(0, 5)
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{dashboardData?.stats?.total || 0}</div>
              <p className="text-xs text-blue-300">Reports you've submitted</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Pending</CardTitle>
              <Clock className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{dashboardData?.stats?.pending || 0}</div>
              <p className="text-xs text-blue-300">Awaiting approval</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{dashboardData?.stats?.approved || 0}</div>
              <p className="text-xs text-blue-300">Fully approved</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 futuristic-subheading">
                <FileText className="h-5 w-5 text-blue-300" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userReports.length > 0 ? (
                <div className="space-y-4">
                  {userReports.map((ncp) => (
                    <div key={ncp.id} className="flex items-center justify-between p-3 glass-panel rounded-lg">
                      <div>
                        <div className="font-medium text-blue-100">{ncp.ncp_id}</div>
                        <div className="text-sm text-blue-300">
                          {ncp.sku_code} • {formatDateOnlyWIB(ncp.date)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ncp.status)}
                      </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-300">No reports found</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 futuristic-subheading">
                <XCircle className="h-5 w-5 text-blue-300" />
                Rejected Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rejectedReports.length > 0 ? (
                <div className="space-y-4">
                  {rejectedReports.map((ncp) => (
                    <div key={ncp.id} className="flex items-center justify-between p-3 glass-panel rounded-lg">
                      <div>
                        <div className="font-medium text-blue-100">{ncp.ncp_id}</div>
                        <div className="text-sm text-blue-300">
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
                <p className="text-blue-300">No rejected reports</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderQALeaderDashboard = () => {
    // Ensure pendingNCPs is an array before using array methods
    const safePendingNCPs = Array.isArray(pendingNCPs) ? pendingNCPs : []
    const pendingApprovals = safePendingNCPs.slice(0, 5)
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{dashboardData?.stats?.pending || 0}</div>
              <p className="text-xs text-blue-300">Reports awaiting your approval</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">0</div>
              <p className="text-xs text-blue-300">Approved in last 24 hours</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Total Approved</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{dashboardData?.stats?.qaApproved || 0}</div>
              <p className="text-xs text-blue-300">Reports you've approved</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Avg. Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">2.5h</div>
              <p className="text-xs text-blue-300">Avg. time to complete RCA</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 futuristic-subheading">
              <User className="h-5 w-5 text-blue-300" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((ncp) => (
                  <div key={ncp.id} className="flex items-center justify-between p-4 glass-panel rounded-lg hover:bg-blue-500/10">
                    <div className="flex-1">
                      <div className="font-medium text-blue-100">{ncp.ncp_id}</div>
                      <div className="text-sm text-blue-300">
                        {ncp.sku_code} • Machine: {ncp.machine_code}
                      </div>
                      <div className="text-xs text-blue-400 mt-1">
                        Submitted: {formatSubmissionDate(ncp.submitted_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(ncp.status)}
                      <Button size="sm" className="glass-panel text-blue-200 hover:bg-blue-500/30">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-blue-300">No pending approvals</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderTeamLeaderDashboard = () => {
    // Ensure pendingNCPs is an array before using array methods
    const safePendingNCPs = Array.isArray(pendingNCPs) ? pendingNCPs : []
    const assignedNCPs = safePendingNCPs.filter(ncp => ncp.status === "qa_approved").slice(0, 5)
    const processedNCPs = safePendingNCPs.filter(ncp => ncp.status === "tl_processed").slice(0, 5)
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Assigned for RCA</CardTitle>
              <Package className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{assignedNCPs.length}</div>
              <p className="text-xs text-blue-300">Pending root cause analysis</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Processed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{processedNCPs.length}</div>
              <p className="text-xs text-blue-300">Awaiting process lead review</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Avg. Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">4.2h</div>
              <p className="text-xs text-blue-300">Average time to complete RCA</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 futuristic-subheading">
                <Package className="h-5 w-5 text-blue-300" />
                Awaiting RCA Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedNCPs.length > 0 ? (
                <div className="space-y-4">
                  {assignedNCPs.map((ncp) => (
                    <div key={ncp.id} className="flex items-center justify-between p-3 glass-panel rounded-lg hover:bg-blue-500/10">
                      <div>
                        <div className="font-medium text-blue-100">{ncp.ncp_id}</div>
                        <div className="text-sm text-blue-300">
                          {ncp.sku_code} • {formatDateOnlyWIB(ncp.date)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="glass-panel text-blue-200 hover:bg-blue-500/30">Process</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-300">No NCPs assigned for RCA</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 futuristic-subheading">
                <CheckCircle className="h-5 w-5 text-blue-300" />
                Processed NCPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processedNCPs.length > 0 ? (
                <div className="space-y-4">
                  {processedNCPs.map((ncp) => (
                    <div key={ncp.id} className="flex items-center justify-between p-3 glass-panel rounded-lg hover:bg-blue-500/10">
                      <div>
                        <div className="font-medium text-blue-100">{ncp.ncp_id}</div>
                        <div className="text-sm text-blue-300">
                          {ncp.sku_code} • Processed: {formatSubmissionDate(ncp.tl_processed_at || '')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ncp.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-300">No processed NCPs</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderProcessLeadDashboard = () => {
    // Ensure pendingNCPs is an array before using array methods
    const safePendingNCPs = Array.isArray(pendingNCPs) ? pendingNCPs : []
    const pendingReviews = safePendingNCPs.filter(ncp => ncp.status === "tl_processed").slice(0, 5)
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{pendingReviews.length}</div>
              <p className="text-xs text-blue-300">Reports awaiting your review</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{dashboardData?.stats?.process_approved || 0}</div>
              <p className="text-xs text-blue-300">Reports you've approved</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Avg. Review Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">1.8h</div>
              <p className="text-xs text-blue-300">Average time to review</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 futuristic-subheading">
              <FileText className="h-5 w-5 text-blue-300" />
              Pending Process Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingReviews.length > 0 ? (
              <div className="space-y-4">
                {pendingReviews.map((ncp) => (
                  <div key={ncp.id} className="flex items-center justify-between p-4 glass-panel rounded-lg hover:bg-blue-500/10">
                    <div className="flex-1">
                      <div className="font-medium text-blue-100">{ncp.ncp_id}</div>
                      <div className="text-sm text-blue-300">
                        {ncp.sku_code} • Machine: {ncp.machine_code}
                      </div>
                      <div className="text-xs text-blue-400 mt-1">
                        Processed: {formatSubmissionDate(ncp.tl_processed_at || '')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(ncp.status)}
                      <Button size="sm" className="glass-panel text-blue-200 hover:bg-blue-500/30">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-blue-300">No pending reviews</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderQAManagerDashboard = () => {
    // Ensure pendingNCPs is an array before using array methods
    const safePendingNCPs = Array.isArray(pendingNCPs) ? pendingNCPs : []
    const pendingApprovals = safePendingNCPs.filter(ncp => ncp.status === "process_approved").slice(0, 5)
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{pendingApprovals.length}</div>
              <p className="text-xs text-blue-300">Reports awaiting final approval</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{dashboardData?.stats?.manager_approved || 0}</div>
              <p className="text-xs text-blue-300">Reports you've approved</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Total Approved This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">0</div>
              <p className="text-xs text-blue-300">Final approvals this month</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 futuristic-subheading">
              <CheckCircle className="h-5 w-5 text-blue-300" />
              Pending Final Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((ncp) => (
                  <div key={ncp.id} className="flex items-center justify-between p-4 glass-panel rounded-lg hover:bg-blue-500/10">
                    <div className="flex-1">
                      <div className="font-medium text-blue-100">{ncp.ncp_id}</div>
                      <div className="text-sm text-blue-300">
                        {ncp.sku_code} • Machine: {ncp.machine_code}
                      </div>
                      <div className="text-xs text-blue-400 mt-1">
                        Process Approved: {formatSubmissionDate(ncp.process_approved_at || '')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(ncp.status)}
                      <Button size="sm" className="glass-panel text-blue-200 hover:bg-blue-500/30">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-blue-300">No pending approvals</p>
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
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Total NCPs</CardTitle>
              <FileText className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{dashboardData?.stats?.total || 0}</div>
              <p className="text-xs text-blue-300">All non-conformance reports</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Pending</CardTitle>
              <Clock className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{dashboardData?.stats?.pending || 0}</div>
              <p className="text-xs text-blue-300">Awaiting approval</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">In Progress</CardTitle>
              <Package className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">
                {((dashboardData?.stats?.qaApproved || 0) + (dashboardData?.stats?.tlProcessed || 0) + (dashboardData?.stats?.process_approved || 0))}
              </div>
              <p className="text-xs text-blue-300">Being processed</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{dashboardData?.stats?.manager_approved || 0}</div>
              <p className="text-xs text-blue-300">Fully approved reports</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm futuristic-subheading">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold futuristic-heading">{dashboardData?.stats?.rejected || 0}</div>
              <p className="text-xs text-blue-300">Rejected reports</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 futuristic-subheading">
                <BarChart3 className="h-5 w-5 text-blue-300" />
                NCPs by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.charts?.monthly && Array.isArray(dashboardData.charts.monthly) && dashboardData.charts.monthly.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.charts.monthly}>
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
                      <Legend />
                      <Bar dataKey="count" name="NCP Count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-blue-300">No data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 futuristic-subheading">
                <PieChartIcon className="h-5 w-5 text-blue-300" />
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
              ) : (
                <p className="text-blue-300">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 futuristic-subheading">
                <Users className="h-5 w-5 text-blue-300" />
                Top Submitters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.charts?.topSubmitters && Array.isArray(dashboardData.charts.topSubmitters) && dashboardData.charts.topSubmitters.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.charts.topSubmitters.map((submitter, index) => (
                    <div key={index} className="flex items-center justify-between p-3 glass-panel rounded-lg">
                      <div className="font-medium text-blue-100">{submitter.submitted_by}</div>
                      <div className="text-lg font-bold text-blue-300">{submitter.count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-300">No data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 futuristic-subheading">
                <Calendar className="h-5 w-5 text-blue-300" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-300">Recent system activity will be shown here</p>
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
          <h2 className="text-2xl font-bold futuristic-heading">Welcome to Quality Assurance Portal</h2>
          <p className="text-blue-300 mt-2">Your dashboard will be customized based on your role.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold futuristic-heading">Dashboard</h1>
          <p className="text-blue-300">Welcome back, {userInfo.fullName || userInfo.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} className="glass-panel text-blue-200 hover:bg-blue-500/30">
            Refresh Data
          </Button>
        </div>
      </div>

      {renderRoleDashboard()}
    </div>
  )
}