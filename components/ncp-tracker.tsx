import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Users, 
  UserCheck,
  Wrench,
  ClipboardCheck
} from "lucide-react"

export function NCPTracker({ ncpReports }) {
  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { 
          icon: Clock, 
          label: "Pending QA Leader Approval", 
          color: "bg-yellow-100 text-yellow-800" 
        }
      case "qa_approved":
        return { 
          icon: UserCheck, 
          label: "Pending Team Leader Processing", 
          color: "bg-blue-100 text-blue-800" 
        }
      case "tl_processed":
        return { 
          icon: Wrench, 
          label: "Pending Process Lead Approval", 
          color: "bg-indigo-100 text-indigo-800" 
        }
      case "process_approved":
        return { 
          icon: ClipboardCheck, 
          label: "Pending QA Manager Approval", 
          color: "bg-purple-100 text-purple-800" 
        }
      case "manager_approved":
        return { 
          icon: CheckCircle, 
          label: "Completed", 
          color: "bg-green-100 text-green-800" 
        }
      case "qa_rejected":
      case "process_rejected":
      case "manager_rejected":
        return { 
          icon: XCircle, 
          label: "Rejected", 
          color: "bg-red-100 text-red-800" 
        }
      default:
        return { 
          icon: FileText, 
          label: "Unknown Status", 
          color: "bg-gray-100 text-gray-800" 
        }
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">NCP Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NCP ID</TableHead>
                <TableHead>SKU Code</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Assignee</TableHead>
                <TableHead>Submitted By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ncpReports.map((report) => {
                const statusInfo = getStatusInfo(report.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.ncp_id}</TableCell>
                    <TableCell>{report.sku_code}</TableCell>
                    <TableCell>{report.machine_code}</TableCell>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.assigned_team_leader || report.qa_leader || "-"}
                    </TableCell>
                    <TableCell>{report.submitted_by}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}