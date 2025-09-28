const Database = require("better-sqlite3")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("🔍 Validating QA Leader to Team Leader workflow...")

try {
  // 1. Check all NCPs and their current status
  console.log("\n📋 All NCP Reports:")
  const allNCPs = db
    .prepare(`
    SELECT ncp_id, status, submitted_by, qa_approved_by, assigned_team_leader, 
           disposisi, jumlah_sortir, jumlah_release, jumlah_reject,
           tl_processed_by, root_cause_analysis
    FROM ncp_reports 
    ORDER BY submitted_at DESC
  `)
    .all()

  allNCPs.forEach((ncp) => {
    console.log(`\n🔸 NCP: ${ncp.ncp_id}`)
    console.log(`   Status: ${ncp.status}`)
    console.log(`   Submitted by: ${ncp.submitted_by}`)
    console.log(`   QA Approved by: ${ncp.qa_approved_by || "Not approved"}`)
    console.log(`   Assigned Team Leader: ${ncp.assigned_team_leader || "Not assigned"}`)
    console.log(`   Has Disposition: ${ncp.disposisi ? "Yes" : "No"}`)
    console.log(
      `   Quantities - Sortir: ${ncp.jumlah_sortir}, Release: ${ncp.jumlah_release}, Reject: ${ncp.jumlah_reject}`,
    )
    console.log(`   TL Processed by: ${ncp.tl_processed_by || "Not processed"}`)
    console.log(`   Has RCA: ${ncp.root_cause_analysis ? "Yes" : "No"}`)
  })

  // 2. Check users and their roles
  console.log(`\n👥 Users by Role:`)
  const users = db.prepare("SELECT username, role, full_name FROM users ORDER BY role, username").all()

  const usersByRole = {}
  users.forEach((user) => {
    if (!usersByRole[user.role]) usersByRole[user.role] = []
    usersByRole[user.role].push(user.username)
  })

  Object.keys(usersByRole).forEach((role) => {
    console.log(`   ${role}: ${usersByRole[role].join(", ")}`)
  })

  // 3. Check for NCPs that should be visible to Team Leaders
  console.log(`\n🎯 NCPs that should be visible to Team Leaders:`)
  const teamLeaderNCPs = db
    .prepare(`
    SELECT ncp_id, status, assigned_team_leader, qa_approved_at, disposisi
    FROM ncp_reports 
    WHERE status IN ('qa_approved', 'tl_processed') 
    AND assigned_team_leader IS NOT NULL
    ORDER BY qa_approved_at DESC
  `)
    .all()

  if (teamLeaderNCPs.length === 0) {
    console.log("   ❌ No NCPs found for Team Leaders!")
    console.log("   This means either:")
    console.log("   - No NCPs have been approved by QA Leader")
    console.log("   - QA Leader approval is not assigning Team Leaders properly")
  } else {
    teamLeaderNCPs.forEach((ncp) => {
      console.log(`   ✅ ${ncp.ncp_id} -> ${ncp.assigned_team_leader} (${ncp.status})`)
    })
  }

  // 4. Check notifications
  console.log(`\n🔔 Recent Notifications:`)
  const notifications = db
    .prepare(`
    SELECT n.title, n.message, u.username, n.created_at, n.is_read, n.ncp_id
    FROM notifications n
    JOIN users u ON n.user_id = u.id
    ORDER BY n.created_at DESC
    LIMIT 10
  `)
    .all()

  if (notifications.length === 0) {
    console.log("   ❌ No notifications found!")
  } else {
    notifications.forEach((notif) => {
      console.log(`   - ${notif.username}: ${notif.title} (${notif.ncp_id}) - ${notif.is_read ? "Read" : "Unread"}`)
    })
  }

  // 5. Check specific workflow issues
  console.log(`\n🔧 Workflow Issues Check:`)

  // Check for NCPs approved by QA Leader but not assigned to Team Leader
  const unassignedApproved = db
    .prepare(`
    SELECT ncp_id, qa_approved_by, assigned_team_leader
    FROM ncp_reports 
    WHERE status = 'qa_approved' AND assigned_team_leader IS NULL
  `)
    .all()

  if (unassignedApproved.length > 0) {
    console.log(`   ❌ Found ${unassignedApproved.length} QA approved NCPs without Team Leader assignment:`)
    unassignedApproved.forEach((ncp) => {
      console.log(`      - ${ncp.ncp_id} (approved by ${ncp.qa_approved_by})`)
    })
  } else {
    console.log(`   ✅ All QA approved NCPs have Team Leader assignments`)
  }

  // Check for Team Leaders that exist in options vs database
  console.log(`\n📝 Team Leader Options vs Database:`)
  const teamLeaderOptions = ["Team Leader 1", "Team Leader 2", "Team Leader 3"]
  const dbTeamLeaders = users.filter((u) => u.role === "team_leader").map((u) => u.username)

  console.log(`   Frontend Options: ${teamLeaderOptions.join(", ")}`)
  console.log(`   Database Users: ${dbTeamLeaders.join(", ")}`)

  const mismatch = teamLeaderOptions.filter((option) => !dbTeamLeaders.includes(option))
  if (mismatch.length > 0) {
    console.log(`   ⚠️  Mismatched options: ${mismatch.join(", ")}`)
    console.log(`   This could cause assignment issues!`)
  }
} catch (error) {
  console.error("❌ Error validating workflow:", error)
} finally {
  db.close()
}
