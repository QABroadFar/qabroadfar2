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
  FileText, 
  Calendar, 
  User, 
  Filter,
  Download
} from "lucide-react"

interface AuditLogEntry {
  id: number
  ncp_id: string
  changed_by: string
  changed_at: string
  field_changed: string
  old_value: string
  new_value: string
  description: string
}

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [userFilter, setUserFilter] = useState("")
  const [fieldFilter, setFieldFilter] = useState("")
  const [loading, setLoading] = useState(true)

  // Mock data initialization
  useEffect(() => {
    // In a real implementation, this would fetch from API
    setTimeout(() => {
      const mockLogs: AuditLogEntry[] = [
        {
          id: 1,
          ncp_id: "2305-0001",
          changed_by: "super_admin",
          changed_at: "2023-05-15T10:30:00Z",
          field_changed: "status",
          old_value: "pending",
          new_value: "qa_approved",
          description: "Status updated by super_admin"
        },
        {
          id: 2,
          ncp_id: "2305-0002",
          changed_by: "super_admin",
          changed_at: "2023-05-16T14:45:00Z",
          field_changed: "assigned_team_leader",
          old_value: "tl_john",
          new_value: "tl_sarah",
          description: "Reassigned to tl_sarah by super_admin"
        },
        {
          id: 3,
          ncp_id: "2305-0003",
          changed_by: "admin_user",
          changed_at: "2023-05-17T09:15:00Z",
          field_changed: "problem_description",
          old_value: "Initial description",
          new_value: "Updated description with more details",
          description: "Problem description updated"
        },
        {
          id: 4,
          ncp_id: "2305-0001",
          changed_by: "super_admin",
          changed_at: "2023-05-18T16:20:00Z",
          field_changed: "status",
          old_value: "qa_approved",
          new_value: "pending",
          description: "Status reverted to pending by super_admin"
        },
        {
          id: 5,
          ncp_id: "2305-0004",
          changed_by: "super_admin",
          changed_at: "2023-05-19T11:30:00Z",
          field_changed: "sku_code",
          old_value: "SKU001",
          new_value: "SKU002",
          description: "SKU code updated by super_admin"
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
        log.ncp_id.toLowerCase().includes(term) ||
        log.changed_by.toLowerCase().includes(term) ||
        log.field_changed.toLowerCase().includes(term) ||
        log.description.toLowerCase().includes(term)
      )
    }
    
    if (dateFilter) {
      result = result.filter(log => 
        log.changed_at.startsWith(dateFilter)
      )
    }
    
    if (userFilter) {
      result = result.filter(log => 
        log.changed_by.toLowerCase().includes(userFilter.toLowerCase())
      )
    }
    
    if (fieldFilter) {
      result = result.filter(log => 
        log.field_changed.toLowerCase().includes(fieldFilter.toLowerCase())
      )
    }
    
    setFilteredLogs(result)
  }, [searchTerm, dateFilter, userFilter, fieldFilter, logs])

  const exportToCSV = () => {
    const headers = [
      "NCP ID",
      "Changed By",
      "Changed At",
      "Field Changed",
      "Old Value",
      "New Value",
      "Description"
    ]
    
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => [
        log.ncp_id,
        log.changed_by,
        log.changed_at,
        log.field_changed,
        `"${log.old_value}"`,
        `"${log.new_value}"`,
        `"${log.description}"`
      ].join(","))
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading audit logs...</span>
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
              <h1 className="text-3xl font-bold text-gray-800">Audit Log</h1>
              <p className="text-gray-600 mt-1">Track all system changes and modifications</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search all fields..."
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
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filter by user..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filter by field..."
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setDateFilter("")
                    setUserFilter("")
                    setFieldFilter("")
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
          <CardContent className="p-0">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Audit Logs Found</h3>
                <p className="text-gray-600">No audit log entries match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NCP ID</TableHead>
                      <TableHead>Changed By</TableHead>
                      <TableHead>Changed At</TableHead>
                      <TableHead>Field Changed</TableHead>
                      <TableHead>Old Value</TableHead>
                      <TableHead>New Value</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-mono font-medium">{log.ncp_id}</TableCell>
                        <TableCell>{log.changed_by}</TableCell>
                        <TableCell>
                          {new Date(log.changed_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{log.field_changed}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={log.old_value}>
                          {log.old_value || "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={log.new_value}>
                          {log.new_value || "-"}
                        </TableCell>
                        <TableCell className="max-w-md">{log.description}</TableCell>
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