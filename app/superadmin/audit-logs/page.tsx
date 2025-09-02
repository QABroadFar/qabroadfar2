"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { formatToWIB } from "@/lib/date-utils"

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState([])
  const [systemLogs, setSystemLogs] = useState([])

  useEffect(() => {
    fetchAuditLogs()
    fetchSystemLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch("/api/audit-log")
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch audit logs",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive"
      })
    }
  }

  const fetchSystemLogs = async () => {
    try {
      const response = await fetch("/api/system-logs")
      if (response.ok) {
        const data = await response.json()
        setSystemLogs(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch system logs",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching system logs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch system logs",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* NCP Audit Logs */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">NCP Audit Logs</CardTitle>
            <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NCP ID</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Field Changed</TableHead>
                    <TableHead>Old Value</TableHead>
                    <TableHead>New Value</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Changed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.ncp_id}</TableCell>
                      <TableCell>{log.changed_by}</TableCell>
                      <TableCell>{log.field_changed}</TableCell>
                      <TableCell>{log.old_value || "-"}</TableCell>
                      <TableCell>{log.new_value || "-"}</TableCell>
                      <TableCell>{log.description}</TableCell>
                      <TableCell>{formatToWIB(log.changed_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* System Logs */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">System Logs</CardTitle>
            <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
          </CardHeader>
          <CardContent>
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
                  {systemLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          log.level === "error" 
                            ? "bg-red-100 text-red-800" 
                            : log.level === "warn" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-green-100 text-green-800"
                        }`}>
                          {log.level}
                        </span>
                      </TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>{log.details || "-"}</TableCell>
                      <TableCell>{formatToWIB(log.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}