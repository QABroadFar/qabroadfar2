const Database = require("better-sqlite3")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("✅ Simulating QA Leader approval...")

try {
  // Get first pending NCP
  const pendingNCP = db.prepare("SELECT * FROM ncp_reports WHERE status = 'pending' LIMIT 1").get()
  
  if (!pendingNCP) {
    console.log("❌ No pending NCPs found!")
    return
  }

  console.log(`📋 Approving NCP: ${pendingNCP.ncp_id}`)

  // Simulate QA Leader approval
  const updateStmt = db.prepare(`
    UPDATE ncp_reports 
    SET status = 'qa_approved',
        qa_approved_by = 'qaleader1',
        qa_approved_at = CURRENT_TIMESTAMP,
        disposisi = 'Sortir dan Release',
        jumlah_sortir = '50',
        jumlah_release = '30',
        jumlah_reject = '20',
        assigned_team_leader = 'teamlead1'
    WHERE id = ?
  `)

  const result = updateStmt.run(pendingNCP.id)

  if (result.changes > 0) {
    console.log("✅ NCP approved and assigned to teamlead1")
    
    // Check the updated NCP
    const updatedNCP = db.prepare("SELECT * FROM ncp_reports WHERE id = ?").get(pendingNCP.id)
    console.log(`📋 Updated NCP: ${updatedNCP.ncp_id}`)
    console.log(`   Status: ${updatedNCP.status}`)
    console.log(`   Assigned to: ${updatedNCP.assigned_team_leader}`)
    console.log(`   Disposisi: ${updatedNCP.disposisi}`)
  } else {
    console.log("❌ Failed to update NCP")
  }

} catch (error) {
  console.error("❌ Error simulating QA approval:", error)
} finally {
  db.close()
}