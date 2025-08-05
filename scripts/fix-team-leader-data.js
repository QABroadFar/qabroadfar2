const Database = require("better-sqlite3")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("🔧 Fixing Team Leader data and assignments...")

try {
  // 1. First, let's create the missing team leaders if they don't exist
  const bcrypt = require("bcryptjs")

  const teamLeadersToCreate = [
    { username: "Team Leader 1", password: "123", fullName: "Team Leader 1" },
    { username: "Team Leader 2", password: "123", fullName: "Team Leader 2" },
    { username: "Team Leader 3", password: "123", fullName: "Team Leader 3" },
  ]

  console.log("👥 Creating missing Team Leader users...")

  for (const tl of teamLeadersToCreate) {
    try {
      // Check if user exists
      const existingUser = db.prepare("SELECT username FROM users WHERE username = ?").get(tl.username)

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(tl.password, 10)
        db.prepare(`
          INSERT INTO users (username, password, role, full_name) 
          VALUES (?, ?, 'team_leader', ?)
        `).run(tl.username, hashedPassword, tl.fullName)
        console.log(`   ✅ Created: ${tl.username}`)
      } else {
        console.log(`   ⚠️  Already exists: ${tl.username}`)
      }
    } catch (error) {
      console.log(`   ❌ Error creating ${tl.username}: ${error.message}`)
    }
  }

  // 2. Fix any qa_approved NCPs that don't have team leader assignments
  console.log("\n🔧 Fixing unassigned NCPs...")

  const unassignedNCPs = db
    .prepare(`
    SELECT id, ncp_id, assigned_team_leader
    FROM ncp_reports 
    WHERE status = 'qa_approved' AND assigned_team_leader IS NULL
  `)
    .all()

  if (unassignedNCPs.length > 0) {
    console.log(`   Found ${unassignedNCPs.length} unassigned NCPs`)

    for (const ncp of unassignedNCPs) {
      // Assign to Team Leader 1 as default
      db.prepare(`
        UPDATE ncp_reports 
        SET assigned_team_leader = 'Team Leader 1'
        WHERE id = ?
      `).run(ncp.id)

      console.log(`   ✅ Assigned ${ncp.ncp_id} to Team Leader 1`)

      // Create notification for the team leader
      const teamLeaderUser = db.prepare("SELECT id FROM users WHERE username = 'Team Leader 1'").get()
      if (teamLeaderUser) {
        db.prepare(`
          INSERT INTO notifications (user_id, ncp_id, title, message, type)
          VALUES (?, ?, ?, ?, 'info')
        `).run(
          teamLeaderUser.id,
          ncp.ncp_id,
          "NCP Assigned to You",
          `NCP ${ncp.ncp_id} has been assigned to you for processing`,
        )
        console.log(`   📧 Created notification for Team Leader 1`)
      }
    }
  } else {
    console.log(`   ✅ All qa_approved NCPs have team leader assignments`)
  }

  // 3. Show current status
  console.log("\n📊 Current Status:")
  const statusCount = db
    .prepare(`
    SELECT status, COUNT(*) as count
    FROM ncp_reports 
    GROUP BY status
    ORDER BY count DESC
  `)
    .all()

  statusCount.forEach((stat) => {
    console.log(`   ${stat.status}: ${stat.count}`)
  })

  // 4. Show team leader assignments
  console.log("\n👨‍💼 Team Leader Assignments:")
  const assignments = db
    .prepare(`
    SELECT assigned_team_leader, COUNT(*) as count
    FROM ncp_reports 
    WHERE assigned_team_leader IS NOT NULL
    GROUP BY assigned_team_leader
    ORDER BY count DESC
  `)
    .all()

  if (assignments.length === 0) {
    console.log("   ❌ No team leader assignments found")
  } else {
    assignments.forEach((assign) => {
      console.log(`   ${assign.assigned_team_leader}: ${assign.count} NCPs`)
    })
  }

  console.log("\n🎉 Team Leader data fix completed!")
} catch (error) {
  console.error("❌ Error fixing team leader data:", error)
} finally {
  db.close()
}
