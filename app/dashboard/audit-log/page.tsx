"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatToWIB } from "@/lib/date-utils"

const AuditLogPage = () => {
  const [auditLog, setAuditLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAuditLog = async () => {
      try {
        const res = await fetch("/api/audit-log")
        if (res.ok) {
          const data = await res.json()
          setAuditLog(data)
        }
      } catch (error) {
        console.error("Failed to fetch audit log", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAuditLog()
  }, [])

  if (loading) {
    return <div>Loading audit log...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">NCP Audit Log</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NCP ID</TableHead>
            <TableHead>Changed By</TableHead>
            <TableHead>Changed At</TableHead>
            <TableHead>Field</TableHead>
            <TableHead>Old Value</TableHead>
            <TableHead>New Value</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditLog.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.ncp_id}</TableCell>
              <TableCell>{log.changed_by}</TableCell>
              <TableCell>{formatToWIB(log.changed_at)}</TableCell>
              <TableCell>{log.field_changed}</TableCell>
              <TableCell>{log.old_value}</TableCell>
              <TableCell>{log.new_value}</TableCell>
              <TableCell>{log.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default AuditLogPage
