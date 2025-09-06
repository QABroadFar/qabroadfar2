"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatToWIB } from "@/lib/date-utils"

const SystemLogsPage = () => {
  const [systemLogs, setSystemLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSystemLogs = async () => {
      try {
        const res = await fetch("/api/system-logs")
        if (res.ok) {
          const data = await res.json()
          setSystemLogs(data)
        }
      } catch (error) {
        console.error("Failed to fetch system logs", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSystemLogs()
  }, [])

  if (loading) {
    return <div>Loading system logs...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">System Logs</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Level</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {systemLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.level}</TableCell>
              <TableCell>{log.message}</TableCell>
              <TableCell>
                <pre>{JSON.stringify(JSON.parse(log.details), null, 2)}</pre>
              </TableCell>
              <TableCell>{formatToWIB(log.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default SystemLogsPage
