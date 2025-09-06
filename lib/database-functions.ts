import { db } from "./database" // Assuming db is imported from a database module
import { createNotificationForRole, createNotification } from "./database" // Importing from database.ts

// Add these functions to your lib/database.ts if missing

// Process Lead approval functions
export function approveNCPByProcessLead(id: number, comment: string, processLeadUsername: string) {
  const stmt = db.prepare(`
    UPDATE ncp_reports 
    SET status = 'process_approved',
        process_approved_by = ?,
        process_approved_at = CURRENT_TIMESTAMP,
        process_comment = ?
    WHERE id = ?
  `)

  const result = stmt.run(processLeadUsername, comment, id)

  if (result.changes > 0) {
    // Get NCP details for notification
    const ncp: any = db.prepare("SELECT ncp_id FROM ncp_reports WHERE id = ?").get(id)

    // Create notification for QA Managers
    createNotificationForRole(
      "qa_manager",
      ncp.ncp_id,
      "NCP Ready for Final Approval",
      `NCP ${ncp.ncp_id} has been approved by Process Lead and requires final QA Manager approval`,
    )
  }

  return result
}

export function rejectNCPByProcessLead(id: number, rejectionReason: string, processLeadUsername: string) {
  const stmt = db.prepare(`
    UPDATE ncp_reports 
    SET status = 'qa_approved',
        process_approved_by = ?,
        process_approved_at = CURRENT_TIMESTAMP,
        process_rejection_reason = ?
    WHERE id = ?
  `)

  const result = stmt.run(processLeadUsername, rejectionReason, id)

  if (result.changes > 0) {
    // Get NCP details for notification
    const ncp: any = db.prepare("SELECT ncp_id, assigned_team_leader FROM ncp_reports WHERE id = ?").get(id)

    // Create notification for assigned team leader
    const teamLeaderUser: any = db.prepare("SELECT id FROM users WHERE username = ?").get(ncp.assigned_team_leader)
    if (teamLeaderUser) {
      createNotification(
        teamLeaderUser.id,
        ncp.ncp_id,
        "NCP Rejected by Process Lead",
        `NCP ${ncp.ncp_id} has been rejected by Process Lead and returned for reprocessing. Reason: ${rejectionReason}`,
      )
    }
  }

  return result
}
