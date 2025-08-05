const Database = require("better-sqlite3")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("🔍 Debugging NCP workflow...")

try {
  // Check all NCPs
  const allNCPs = db.prepare("SELECT * FROM ncp_reports ORDER BY submitted_at DESC").all()
  
  console.log(`\n📋 Found ${allNCPs.length} NCP reports:`)
  allNCPs.forEach(ncp => {
    console.log(`  - ${ncp.ncp_id}: ${ncp.status} (assigned to: ${ncp.assigned_team_leader || 'none'})`)
  })

  // Check pending NCPs for QA Leader
  const pendingNCPs = db.prepare("SELECT * FROM ncp_reports WHERE status = 'pending'").all()
  console.log(`\n⏳ Pending NCPs for QA Leader: ${pendingNCPs.length}`)

  // Check qa_approved NCPs
  const qaApprovedNCPs = db.prepare("SELECT * FROM ncp_reports WHERE status = 'qa_approved'").all()
  console.log(`\n✅ QA Approved NCPs: ${qaApprovedNCPs.length}`)
  qaApprovedNCPs.forEach(ncp => {
    console.log(`  - ${ncp.ncp_id}: assigned to ${ncp.assigned_team_leader}`)
  })

  // Check team leader assignments
  const teamLeaderAssignments = db.prepare(`
    SELECT assigned_team_leader, COUNT(*) as count 
    FROM ncp_reports 
    WHERE status = 'qa_approved' 
    GROUP BY assigned_team_leader
  `).all()
  
  console.log(`\n👥 Team Leader Assignments:`)
  teamLeaderAssignments.forEach(assignment => {
    console.log(`  - ${assignment.assigned_team_leader}: ${assignment.count} NCPs`)
  })

  // Check users
  const users = db.prepare("SELECT username, role FROM users WHERE role = 'team_leader'").all()
  console.log(`\n👤 Team Leader Users:`)
  users.forEach(user => {
    console.log(`  - ${user.username} (${user.role})`)
  })

} catch (error) {
  console.error("❌ Error debugging workflow:", error)
} finally {
  db.close()
}