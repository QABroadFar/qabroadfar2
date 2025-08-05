const Database = require("better-sqlite3")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("🔍 Debugging NCP Workflow...")

try {
  // Check all NCPs and their status
  const ncps = db.prepare(`
    SELECT ncp_id, status, submitted_by, qa_approved_by, assigned_team_leader, 
           tl_processed_by, disposisi, photo_attachment
    FROM ncp_reports 
    ORDER BY submitted_at DESC
  `).all()

  console.log(`\n📋 Found ${ncps.length} NCP reports:`)
  
  ncps.forEach(ncp => {
    console.log(`\n🔸 NCP: ${ncp.ncp_id}`)
    console.log(`   Status: ${ncp.status}`)
    console.log(`   Submitted by: ${ncp.submitted_by}`)
    console.log(`   QA Approved by: ${ncp.qa_approved_by || 'Not approved'}`)
    console.log(`   Assigned Team Leader: ${ncp.assigned_team_leader || 'Not assigned'}`)
    console.log(`   TL Processed by: ${ncp.tl_processed_by || 'Not processed'}`)
    console.log(`   Has Photo: ${ncp.photo_attachment ? 'Yes' : 'No'}`)
    if (ncp.photo_attachment) {
      console.log(`   Photo Path: ${ncp.photo_attachment}`)
    }
  })

  // Check team leaders
  console.log(`\n👥 Team Leaders in database:`)
  const teamLeaders = db.prepare("SELECT username, full_name FROM users WHERE role = 'team_leader'").all()
  teamLeaders.forEach(tl => {
    console.log(`   - ${tl.username} (${tl.full_name})`)
  })

  // Check notifications
  console.log(`\n🔔 Recent notifications:`)
  const notifications = db.prepare(`
    SELECT n.title, n.message, u.username, n.created_at, n.is_read
    FROM notifications n
    JOIN users u ON n.user_id = u.id
    ORDER BY n.created_at DESC
    LIMIT 10
  `).all()
  
  notifications.forEach(notif => {
    console.log(`   - ${notif.username}: ${notif.title} (${notif.is_read ? 'Read' : 'Unread'})`)
  })

} catch (error) {
  console.error("❌ Error debugging workflow:", error)
} finally {
  db.close()
}
