"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  Search, 
  Calendar, 
  Filter,
  Download,
  AlertCircle,
  Info,
  AlertTriangle
} from "lucide-react"

interface SystemLogEntry {
  id: number
  level: "info" | "warn" | "error"
  message: string
  details: string
  created_at: string
}

export function SystemLogs() {
  const [logs, setLogs] = useState<SystemLogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<SystemLogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  // Mock data initialization
  useEffect(() => {
    // In a real implementation, this would fetch from API
    setTimeout(() => {
      const mockLogs: SystemLogEntry[] = [
        {
          id: 1,
          level: "info",
          message: "User login successful",
          details: "User super_admin logged in from IP 192.168.1.100",
          created_at: "2023-05-15T10:30:00Z"
        },
        {
          id: 2,
          level: "warn",
          message: "Database query slow",
          details: "Query on ncp_reports table took 2.5 seconds to execute",
          created_at: "2023-05-15T11:45:00Z"
        },
        {
          id: 3,
          level: "error",
          message: "Failed to generate report",
          details: "Database connection timeout while generating monthly report",
          created_at: "2023-05-15T12:15:00Z"
        },
        {
          id: 4,
          level: "info",
          message: "NCP report submitted",
          details: "NCP 2305-0001 submitted by user qa_user",
          created_at: "2023-05-15T13:20:00Z"
        },
        {
          id: 5,
          level: "warn",
          message: "High memory usage",
          details: "Memory usage reached 85% of available capacity",
          created_at: "2023-05-15T14:30:00Z"
        },
        {
          id: 6,
          level: "error",
          message: "Email notification failed",
          details: "Failed to send notification email to tl_john for NCP 2305-0002",
          created_at: "2023-05-15T15:45:00Z"
        },
        {
          id: 7,
          level: "info",
          message: "System backup completed",
          details: "Daily backup completed successfully, size: 125MB",
          created_at: "2023-05-15T16:00:00Z"
        },
        {
          id: 8,
          level: "warn",
          message: "Login attempt failed",
          details: "Failed login attempt for user admin_user from IP 192.168.1.105",
          created_at: "2023-05-15T17:30:00Z"
        }
      ]
      
      setLogs(mockLogs)
      setFilteredLogs(mockLogs)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter logs based on search criteria
  useEffect(() => {
    let result = [...logs]
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(log => 
        log.message.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term)
      )
    }
    
    if (dateFilter) {
      result = result.filter(log => 
        log.created_at.startsWith(dateFilter)
      )
    }
    
    if (levelFilter !== "all") {
      result = result.filter(log => 
        log.level === levelFilter
      )
    }
    
    setFilteredLogs(result)
  }, [searchTerm, dateFilter, levelFilter, logs])

  const exportToCSV = () => {
    const headers = [
      "Level",
      "Message",
      "Details",
      "Created At"
    ]
    
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => [
        log.level,
        `"${log.message}"`,
        `"${log.details}"`,
        log.created_at
      ].join(","))
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "info":
        return <Badge className="bg-blue-100 text-blue-800"><Info className="h-3 w-3 mr-1 inline" /> Info</Badge>
      case "warn":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1 inline" /> Warning</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1 inline" /> Error</Badge>
      default:
        return <Badge variant="secondary">{level}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading system logs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">System Logs</h1>
              <p className="text-gray-600 mt-1">Monitor system events and activities</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={exportToCSV} variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {filteredLogs.length} Entries
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setDateFilter("")
                    setLevelFilter("all")
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Logs Table */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
          <CardContent className="p-0">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No System Logs Found</h3>
                <p className="text-gray-600">No system log entries match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50/50">
                        <TableCell>{getLevelBadge(log.level)}</TableCell>
                        <TableCell className="font-medium max-w-md">{log.message}</TableCell>
                        <TableCell className="text-gray-600 max-w-lg">{log.details}</TableCell>
                        <TableCell>
                          {new Date(log.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}