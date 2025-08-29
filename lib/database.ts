import Database from "better-sqlite3"
import { compare, hashSync } from "bcryptjs"
import crypto from "crypto"

// Database schema and connection
const db = new Database("qa_portal.db")

// Initialize database tables (called only if tables don't exist)
export function initializeDatabase() {
  // Check if tables exist
  const tablesExist = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get()
  if (tablesExist) {
    return
  }

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      full_name TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // NCP Reports table with extended fields for approval workflow
  db.exec(`
    CREATE TABLE IF NOT EXISTS ncp_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ncp_id TEXT UNIQUE NOT NULL,
      sku_code TEXT NOT NULL,
      machine_code TEXT NOT NULL,
      date TEXT NOT NULL,
      time_incident TEXT NOT NULL,
      hold_quantity INTEGER NOT NULL,
      hold_quantity_uom TEXT NOT NULL,
      problem_description TEXT NOT NULL,
      photo_attachment TEXT,
      qa_leader TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      submitted_by TEXT NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      -- QA Leader Approval Fields
      qa_approved_by TEXT,
      qa_approved_at DATETIME,
      disposisi TEXT,
      jumlah_sortir TEXT DEFAULT '0',
      jumlah_release TEXT DEFAULT '0',
      jumlah_reject TEXT DEFAULT '0',
      assigned_team_leader TEXT,
      qa_rejection_reason TEXT,

      -- Team Leader Fields
      tl_processed_by TEXT,
      tl_processed_at DATETIME,
      root_cause_analysis TEXT,
      corrective_action TEXT,
      preventive_action TEXT,

      -- Process Lead Fields
      process_approved_by TEXT,
      process_approved_at DATETIME,
      process_rejection_reason TEXT,
      process_comment TEXT,

      -- QA Manager Fields
      manager_approved_by TEXT,
      manager_approved_at DATETIME,
      manager_rejection_reason TEXT,
      manager_comment TEXT,

      -- Final status
      archived_at DATETIME
    )
  `)

  // NCP Audit Log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ncp_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ncp_id TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      field_changed TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      description TEXT
    )
  `)

  // System Logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL, -- e.g., 'info', 'warn', 'error'
      message TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // API Keys table
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      service_name TEXT NOT NULL,
      permissions TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME,
      is_active BOOLEAN DEFAULT TRUE
    )
  `)

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ncp_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `)
}

// FIXED: Generate automatic NCP number with format YYMM-XXXX
export function generateNCPNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, "0")

  // Get the latest serial number for current year
  const latestRecord = db
    .prepare(`
    SELECT ncp_id FROM ncp_reports 
    WHERE ncp_id LIKE ? 
    ORDER BY ncp_id DESC 
    LIMIT 1
  `)
    .get(`${year}${month}-%`)

  let serialNumber = 1

  if (latestRecord) {
    const existingSerial = latestRecord.ncp_id.split("-")[1]
    serialNumber = Number.parseInt(existingSerial) + 1
  }

  const formattedSerial = serialNumber.toString().padStart(4, "0")
  return `${year}${month}-${formattedSerial}`
}

// FIXED: User authentication functions
export async function authenticateUser(username: string, password: string) {
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username)
  if (!user) return null

  const isValid = await compare(password, user.password)
  if (!isValid) return null

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.full_name,
  }
}

// Get user by username
export function getUserByUsername(username: string) {
  return db.prepare("SELECT id, username, role, full_name FROM users WHERE username = ?").get(username)
}

export function getAllUsers() {
  return db.prepare("SELECT id, username, role, full_name, is_active, created_at FROM users").all()
}

export function getUsersByRole(role: string) {
  return db.prepare("SELECT id, username, full_name FROM users WHERE role = ? AND is_active = TRUE").all(role)
}

export function updateUserRole(userId: number, newRole:string) {
  const stmt = db.prepare("UPDATE users SET role = ? WHERE id = ?")
  const result = stmt.run(newRole, userId)
  return result
}

export function createUser(username: string, password: string, role: string, fullName: string) {
  try {
    const hashedPassword = hashSync(password, 10)
    const stmt = db.prepare(`
      INSERT INTO users (username, password, role, full_name, is_active)
      VALUES (?, ?, ?, ?, ?)
    `)
    const result = stmt.run(username, hashedPassword, role, fullName || null, true)
    console.log("User created successfully:", { username, role, fullName })
    return result
  } catch (error) {
    console.error("Error in createUser function:", error)
    throw error
  }
}

export function deleteUser(userId: number) {
  const stmt = db.prepare("DELETE FROM users WHERE id = ?")
  const result = stmt.run(userId)
  return result
}

export function updateUserPassword(userId: number, newPassword: string) {
  const hashedPassword = hashSync(newPassword, 10)
  const stmt = db.prepare("UPDATE users SET password = ? WHERE id = ?")
  const result = stmt.run(hashedPassword, userId)
  return result
}

export function updateUserStatus(userId: number, isActive: boolean) {
  const stmt = db.prepare("UPDATE users SET is_active = ? WHERE id = ?")
  const result = stmt.run(isActive ? 1 : 0, userId)
  return result
}

export function logNCPChange(ncpId: string, changedBy: string, fieldChanged: string, oldValue: any, newValue: any, description: string) {
  const stmt = db.prepare(`
    INSERT INTO ncp_audit_log (ncp_id, changed_by, field_changed, old_value, new_value, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(ncpId, changedBy, fieldChanged, String(oldValue), String(newValue), description);
}

export function superEditNCP(ncpId: number, data: any, changedBy: string) {
  const ncp = getNCPById(ncpId)
  if (!ncp) {
    return { changes: 0 }
  }

  const fields = Object.keys(data)
  const values = Object.values(data)

  if (fields.length === 0) {
    return { changes: 0 }
  }

  for (const field of fields) {
    if (ncp[field] !== data[field]) {
      logNCPChange(
        ncp.ncp_id,
        changedBy,
        field,
        ncp[field],
        data[field],
        `Field ${field} updated by super_admin`,
      )
    }
  }

  const setClause = fields.map((field) => `${field.replace(/([A-Z])/g, "_$1").toLowerCase()} = ?`).join(", ")

  const stmt = db.prepare(`
    UPDATE ncp_reports
    SET ${setClause}
    WHERE id = ?
  `)

  const result = stmt.run(...values, ncpId)
  return result
}

export function revertNCPStatus(ncpId: number, newStatus: string, changedBy: string) {
  const ncp = getNCPById(ncpId)
  if (ncp) {
    logNCPChange(
      ncp.ncp_id,
      changedBy,
      "status",
      ncp.status,
      newStatus,
      `Status reverted to ${newStatus} by super_admin`,
    )
  }

  const stmt = db.prepare("UPDATE ncp_reports SET status = ? WHERE id = ?")
  const result = stmt.run(newStatus, ncpId)
  return result
}

export function reassignNCP(ncpId: number, newAssignee: string, role: "qa_leader" | "team_leader", changedBy: string) {
  const ncp = getNCPById(ncpId)
  if (!ncp) return { changes: 0 }

  let columnToUpdate = ""
  let oldAssignee = ""
  if (role === "qa_leader") {
    columnToUpdate = "qa_leader"
    oldAssignee = ncp.qa_leader
  } else if (role === "team_leader") {
    columnToUpdate = "assigned_team_leader"
    oldAssignee = ncp.assigned_team_leader
  } else {
    return { changes: 0 }
  }

  logNCPChange(
    ncp.ncp_id,
    changedBy,
    columnToUpdate,
    oldAssignee,
    newAssignee,
    `Reassigned to ${newAssignee} by super_admin`,
  )

  const stmt = db.prepare(`UPDATE ncp_reports SET ${columnToUpdate} = ? WHERE id = ?`)
  const result = stmt.run(newAssignee, ncpId)
  return result
}

export function getNCPsByMonth() {
  const query = `
    SELECT strftime('%Y-%m', submitted_at) as month, COUNT(*) as count
    FROM ncp_reports
    WHERE submitted_at >= strftime('%Y-%m-%d %H:%M:%S', date('now', '-12 months'))
    GROUP BY month
    ORDER BY month;
  `
  return db.prepare(query).all()
}

export function getAverageApprovalTime() {
  const query = `
    SELECT AVG(julianday(manager_approved_at) - julianday(submitted_at)) * 24 * 60 as avg_minutes
    FROM ncp_reports
    WHERE status = 'manager_approved';
  `
  const result = db.prepare(query).get()
  return result ? result.avg_minutes : 0
}

export function getNCPStatusDistribution() {
  const query = `
    SELECT status, COUNT(*) as count
    FROM ncp_reports
    GROUP BY status;
  `
  return db.prepare(query).all()
}

export function getNCPsByTopSubmitters(limit = 5) {
  const query = `
    SELECT submitted_by, COUNT(*) as count
    FROM ncp_reports
    GROUP BY submitted_by
    ORDER BY count DESC
    LIMIT ?;
  `
  return db.prepare(query).all(limit)
}

export function getAuditLog() {
  return db.prepare("SELECT * FROM ncp_audit_log ORDER BY changed_at DESC").all()
}

export function logSystemEvent(level: "info" | "warn" | "error", message: string, details: any) {
  const stmt = db.prepare(`
    INSERT INTO system_logs (level, message, details)
    VALUES (?, ?, ?)
  `)
  stmt.run(level, message, JSON.stringify(details))
}

export function getSystemLogs() {
  return db.prepare("SELECT * FROM system_logs ORDER BY created_at DESC").all()
}

export function getApiKeys() {
  return db.prepare("SELECT * FROM api_keys").all()
}

export function createApiKey(serviceName: string, permissions: string[]) {
  const key = `sk_${crypto.randomBytes(24).toString("hex")}`
  const stmt = db.prepare(`
    INSERT INTO api_keys (key, service_name, permissions)
    VALUES (?, ?, ?)
  `)
  stmt.run(key, serviceName, JSON.stringify(permissions))
  return { key }
}

export function deleteApiKey(id: number) {
  const stmt = db.prepare("DELETE FROM api_keys WHERE id = ?")
  return stmt.run(id)
}

export function createNCPReport(data: any, submittedBy: string) {
  const ncpId = generateNCPNumber()

  const stmt = db.prepare(`
    INSERT INTO ncp_reports (
      ncp_id, sku_code, machine_code, date, time_incident,
      hold_quantity, hold_quantity_uom, problem_description,
      photo_attachment, qa_leader, submitted_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    ncpId,
    data.skuCode,
    data.machineCode,
    data.date,
    data.timeIncident,
    data.holdQuantity,
    data.holdQuantityUOM,
    data.problemDescription,
    data.photoAttachment || null,
    data.qaLeader,
    submittedBy,
  )

  // Create notification for the selected QA Leader
  const qaLeaderUser = db.prepare("SELECT id FROM users WHERE username = ?").get(data.qaLeader)
  if (qaLeaderUser) {
    createNotification(
      qaLeaderUser.id,
      ncpId,
      "New NCP Submitted",
      `NCP ${ncpId} requires your approval`,
    )
  }

  return { id: result.lastInsertRowid, ncpId }
}

// Get all NCP reports for database view and flow tracker
export function getAllNCPReports() {
  return db.prepare("SELECT * FROM ncp_reports ORDER BY submitted_at DESC").all()
}

// Get NCPs based on user role and permissions
export function getNCPReportsForUser(userId: number, userRole: string, username: string) {
  let query = "SELECT * FROM ncp_reports"
  let params: any[] = []

  switch (userRole) {
    case "user":
      query += " WHERE submitted_by = ? ORDER BY submitted_at DESC"
      params = [username]
      break
    case "qa_leader":
      query += " ORDER BY submitted_at DESC"
      break
    case "team_leader":
      query += " WHERE assigned_team_leader = ? ORDER BY submitted_at DESC"
      params = [username]
      break
    case "process_lead":
      query += " WHERE status IN ('tl_processed', 'process_approved', 'process_rejected') ORDER BY submitted_at DESC"
      break
    case "qa_manager":
    case "admin":
      query += " ORDER BY submitted_at DESC"
      break
    default:
      query += " WHERE submitted_by = ? ORDER BY submitted_at DESC"
      params = [username]
  }

  const results = db.prepare(query).all(...params)
  return results
}

// Get pending NCPs for approval based on role
export function getPendingNCPsForRole(userRole: string, username: string) {
  let query = ""
  let params: any[] = []

  switch (userRole) {
    case "qa_leader":
      query = "SELECT * FROM ncp_reports WHERE status = 'pending' AND qa_leader = ? ORDER BY submitted_at ASC"
      params = [username]
      break
    case "team_leader":
      // FIXED: Show NCPs assigned to this team leader
      query = `
        SELECT * FROM ncp_reports 
        WHERE assigned_team_leader = ? 
        AND status IN ('qa_approved', 'tl_processed') 
        ORDER BY qa_approved_at ASC
      `
      params = [username]
      break
    case "process_lead":
      query = "SELECT * FROM ncp_reports WHERE status = 'tl_processed' ORDER BY tl_processed_at ASC"
      break
    case "qa_manager":
      query = "SELECT * FROM ncp_reports WHERE status = 'process_approved' ORDER BY process_approved_at ASC"
      break
    default:
      return []
  }

  const results = db.prepare(query).all(...params)
  return results
}

// Get single NCP by ID
export function getNCPById(id: number) {
  const result = db.prepare("SELECT * FROM ncp_reports WHERE id = ?").get(id)
  return result
}

// FIXED: QA Leader approval - Proper data flow to Team Leader
export function approveNCPByQALeader(id: number, approvalData: any, qaLeaderUsername: string) {
  const stmt = db.prepare(`
    UPDATE ncp_reports 
    SET status = 'qa_approved',
        qa_approved_by = ?,
        qa_approved_at = CURRENT_TIMESTAMP,
        disposisi = ?,
        jumlah_sortir = ?,
        jumlah_release = ?,
        jumlah_reject = ?,
        assigned_team_leader = ?
    WHERE id = ?
  `)

  const result = stmt.run(
    qaLeaderUsername,
    approvalData.disposisi,
    approvalData.jumlahSortir || "0",
    approvalData.jumlahRelease || "0",
    approvalData.jumlahReject || "0",
    approvalData.assignedTeamLeader,
    id,
  )

  if (result.changes > 0) {
    // Get NCP details for notification
    const ncp = db.prepare("SELECT ncp_id FROM ncp_reports WHERE id = ?").get(id)

    // FIXED: Create notification for assigned team leader using the exact username
    const teamLeaderUser = db.prepare("SELECT id FROM users WHERE username = ?").get(approvalData.assignedTeamLeader)
    if (teamLeaderUser) {
      createNotification(
        teamLeaderUser.id,
        ncp.ncp_id,
        "NCP Assigned to You",
        `NCP ${ncp.ncp_id} has been approved by QA Leader and assigned to you for RCA analysis`,
      )
    }

    // The backup notification is removed to target only the specific team leader.
  }

  return result
}

// QA Leader rejection
export function rejectNCPByQALeader(id: number, rejectionReason: string, qaLeaderUsername: string) {
  const stmt = db.prepare(`
    UPDATE ncp_reports 
    SET status = 'qa_rejected',
        qa_approved_by = ?,
        qa_approved_at = CURRENT_TIMESTAMP,
        qa_rejection_reason = ?
    WHERE id = ?
  `)

  const result = stmt.run(qaLeaderUsername, rejectionReason, id)
  return result
}

// Team Leader processing
export function processNCPByTeamLeader(id: number, processData: any, teamLeaderUsername: string) {
  const stmt = db.prepare(`
    UPDATE ncp_reports 
    SET status = 'tl_processed',
        tl_processed_by = ?,
        tl_processed_at = CURRENT_TIMESTAMP,
        root_cause_analysis = ?,
        corrective_action = ?,
        preventive_action = ?
    WHERE id = ?
  `)

  const result = stmt.run(
    teamLeaderUsername,
    processData.rootCauseAnalysis,
    processData.correctiveAction,
    processData.preventiveAction,
    id,
  )

  if (result.changes > 0) {
    // Get NCP details for notification
    const ncp = db.prepare("SELECT ncp_id FROM ncp_reports WHERE id = ?").get(id)

    // Create notification for process leads
    createNotificationForRole(
      "process_lead",
      ncp.ncp_id,
      "NCP Ready for Process Review",
      `NCP ${ncp.ncp_id} has been processed by Team Leader and requires process review`,
    )
  }

  return result
}

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
    const ncp = db.prepare("SELECT ncp_id FROM ncp_reports WHERE id = ?").get(id)

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
    const ncp = db.prepare("SELECT ncp_id, assigned_team_leader FROM ncp_reports WHERE id = ?").get(id)

    // Create notification for assigned team leader
    const teamLeaderUser = db.prepare("SELECT id FROM users WHERE username = ?").get(ncp.assigned_team_leader)
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

// QA Manager approval functions
export function approveNCPByQAManager(id: number, comment: string, qaManagerUsername: string) {
  const stmt = db.prepare(`
    UPDATE ncp_reports 
    SET status = 'manager_approved',
        manager_approved_by = ?,
        manager_approved_at = CURRENT_TIMESTAMP,
        manager_comment = ?,
        archived_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)

  const result = stmt.run(qaManagerUsername, comment, id)

  if (result.changes > 0) {
    // Get NCP details for notification
    const ncp = db.prepare("SELECT ncp_id, submitted_by FROM ncp_reports WHERE id = ?").get(id)

    // Create notification for original submitter
    const submitterUser = db.prepare("SELECT id FROM users WHERE username = ?").get(ncp.submitted_by)
    if (submitterUser) {
      createNotification(
        submitterUser.id,
        ncp.ncp_id,
        "NCP Workflow Completed",
        `NCP ${ncp.ncp_id} has been fully approved and archived. The workflow is now complete.`,
      )
    }

    // Also notify QA Leader
    const ncpDetails = db.prepare("SELECT qa_approved_by FROM ncp_reports WHERE id = ?").get(id)
    if (ncpDetails.qa_approved_by) {
      const qaLeaderUser = db.prepare("SELECT id FROM users WHERE username = ?").get(ncpDetails.qa_approved_by)
      if (qaLeaderUser) {
        createNotification(
          qaLeaderUser.id,
          ncp.ncp_id,
          "NCP Workflow Completed",
          `NCP ${ncp.ncp_id} has been fully approved by QA Manager and archived.`,
        )
      }
    }
  }

  return result
}

export function rejectNCPByQAManager(id: number, rejectionReason: string, qaManagerUsername: string) {
  const stmt = db.prepare(`
    UPDATE ncp_reports 
    SET status = 'qa_approved',
        manager_approved_by = ?,
        manager_approved_at = CURRENT_TIMESTAMP,
        manager_rejection_reason = ?
    WHERE id = ?
  `)

  const result = stmt.run(qaManagerUsername, rejectionReason, id)

  if (result.changes > 0) {
    // Get NCP details for notification
    const ncp = db.prepare("SELECT ncp_id, assigned_team_leader FROM ncp_reports WHERE id = ?").get(id)

    // Create notification for assigned team leader
    const teamLeaderUser = db.prepare("SELECT id FROM users WHERE username = ?").get(ncp.assigned_team_leader)
    if (teamLeaderUser) {
      createNotification(
        teamLeaderUser.id,
        ncp.ncp_id,
        "NCP Rejected by QA Manager",
        `NCP ${ncp.ncp_id} has been rejected by QA Manager and returned for reprocessing. Reason: ${rejectionReason}`,
      )
    }
  }

  return result
}

// FIXED: Notification functions
export function createNotification(userId: number, ncpId: string, title: string, message: string, type = "info") {
  const stmt = db.prepare(`
    INSERT INTO notifications (user_id, ncp_id, title, message, type)
    VALUES (?, ?, ?, ?, ?)
  `)

  const result = stmt.run(userId, ncpId, title, message, type)
  return result
}

export function createNotificationForRole(role: string, ncpId: string, title: string, message: string, type = "info") {
  const users = db.prepare("SELECT id FROM users WHERE role = ?").all(role)

  for (const user of users) {
    createNotification(user.id, ncpId, title, message, type)
  }
}

export function getNotificationsForUser(userId: number, limit = 10) {
  return db
    .prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `)
    .all(userId, limit)
}

export function getUnreadNotificationCount(userId: number) {
  const result = db
    .prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE")
    .get(userId)
  return result.count
}

export function markNotificationAsRead(notificationId: number) {
  return db.prepare("UPDATE notifications SET is_read = TRUE WHERE id = ?").run(notificationId)
}

export function markAllNotificationsAsRead(userId: number) {
  return db.prepare("UPDATE notifications SET is_read = TRUE WHERE user_id = ?").run(userId)
}

// Statistics functions
export function getNCPStatistics() {
  const total = db.prepare("SELECT COUNT(*) as count FROM ncp_reports").get()
  const pending = db.prepare('SELECT COUNT(*) as count FROM ncp_reports WHERE status = "pending"').get()
  const qaApproved = db.prepare('SELECT COUNT(*) as count FROM ncp_reports WHERE status = "qa_approved"').get()
  const tlProcessed = db.prepare('SELECT COUNT(*) as count FROM ncp_reports WHERE status = "tl_processed"').get()
  const rejected = db.prepare('SELECT COUNT(*) as count FROM ncp_reports WHERE status LIKE "%rejected"').get()

  return {
    total: total.count,
    pending: pending.count,
    qaApproved: qaApproved.count,
    tlProcessed: tlProcessed.count,
    rejected: rejected.count,
  }
}

export function getNCPStatisticsForRole(userRole: string, username: string) {
  let baseQuery = ""
  let params: any[] = []

  switch (userRole) {
    case "user":
      baseQuery = "FROM ncp_reports WHERE submitted_by = ?"
      params = [username]
      break
    case "qa_leader":
      baseQuery = "FROM ncp_reports"
      break
    case "team_leader":
      baseQuery = "FROM ncp_reports WHERE assigned_team_leader = ?"
      params = [username]
      break
    default:
      baseQuery = "FROM ncp_reports"
  }

  const total = db.prepare(`SELECT COUNT(*) as count ${baseQuery}`).get(...params)
  const pending = db.prepare(`SELECT COUNT(*) as count ${baseQuery} AND status = 'pending'`).get(...params)
  const approved = db.prepare(`SELECT COUNT(*) as count ${baseQuery} AND status LIKE '%approved'`).get(...params)
  const processed = db.prepare(`SELECT COUNT(*) as count ${baseQuery} AND status LIKE '%processed'`).get(...params)

  return {
    total: total.count,
    pending: pending.count,
    approved: approved.count,
    processed: processed.count,
  }
}

// Update existing records to have default values for new columns
export function updateExistingRecords() {
  const updateQuery = `
    UPDATE ncp_reports SET 
      jumlah_sortir = COALESCE(jumlah_sortir, '0'),
      jumlah_release = COALESCE(jumlah_release, '0'), 
      jumlah_reject = COALESCE(jumlah_reject, '0')
    WHERE jumlah_sortir IS NULL OR jumlah_release IS NULL OR jumlah_reject IS NULL
  `

  const result = db.prepare(updateQuery).run()
  return result
}

// Initialize database on import
initializeDatabase()
updateExistingRecords()

export { db }