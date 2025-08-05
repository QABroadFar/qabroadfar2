const Database = require("better-sqlite3")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("🔧 Fixing Team Leader assignments...")

try {
  // Update any qa_approved NCPs that don't have assigned team leader
  const updateStmt = db.prepare(`
    UPDATE ncp_reports 
    SET assigned_team_leader = 'teamlead1'
    WHERE status = 'qa_approved' AND assigned_team_leader IS NULL
  `)
  
  const result = updateStmt.run()
  console.log(`✅ Updated ${result.changes} NCPs with team leader assignment`)

  // Show current status
  const ncps = db.prepare(`
    SELECT ncp_id, status, assigned_team_leader 
    FROM ncp_reports 
    WHERE status = 'qa_approved'
  `).all()

  console.log(`\n📋 QA Approved NCPs:`)
  ncps.forEach(ncp => {
    console.log(`   - ${ncp.ncp_id}: assigned to ${ncp.assigned_team_leader}`)
  })

} catch (error) {
  console.error("❌ Error fixing assignments:", error)
} finally {
  db.close()
}
