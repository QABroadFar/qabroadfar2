const Database = require("better-sqlite3")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("🔄 Testing complete NCP workflow...")

try {
  // Step 1: Check initial state
  console.log("\n📋 Step 1: Initial State")
  const allNCPs = db.prepare("SELECT * FROM ncp_reports ORDER BY submitted_at DESC").all()
  allNCPs.forEach(ncp => {
    console.log(`  - ${ncp.ncp_id}: ${ncp.status} (assigned to: ${ncp.assigned_team_leader || 'none'})`)
  })

  // Step 2: Simulate QA Leader approval for second NCP
  console.log("\n✅ Step 2: QA Leader Approval")
  const pendingNCP = db.prepare("SELECT * FROM ncp_reports WHERE status = 'pending' LIMIT 1").get()
  
  if (pendingNCP) {
    console.log(`📋 Approving NCP: ${pendingNCP.ncp_id}`)
    
    const updateStmt = db.prepare(`
      UPDATE ncp_reports 
      SET status = 'qa_approved',
          qa_approved_by = 'qaleader1',
          qa_approved_at = CURRENT_TIMESTAMP,
          disposisi = 'Sortir dan Release',
          jumlah_sortir = '25',
          jumlah_release = '15',
          jumlah_reject = '10',
          assigned_team_leader = 'teamlead2'
      WHERE id = ?
    `)

    const result = updateStmt.run(pendingNCP.id)
    
    if (result.changes > 0) {
      console.log("✅ NCP approved and assigned to teamlead2")
    }
  }

  // Step 3: Check final state
  console.log("\n📋 Step 3: Final State")
  const finalNCPs = db.prepare("SELECT * FROM ncp_reports ORDER BY submitted_at DESC").all()
  finalNCPs.forEach(ncp => {
    console.log(`  - ${ncp.ncp_id}: ${ncp.status} (assigned to: ${ncp.assigned_team_leader || 'none'})`)
  })

  // Step 4: Check what team leaders should see
  console.log("\n👥 Step 4: Team Leader Visibility")
  
  // Check what teamlead1 should see
  const teamlead1NCPs = db.prepare(`
    SELECT * FROM ncp_reports 
    WHERE assigned_team_leader = 'teamlead1' 
    AND status IN ('qa_approved', 'tl_processed')
  `).all()
  console.log(`  teamlead1 should see: ${teamlead1NCPs.length} NCPs`)
  teamlead1NCPs.forEach(ncp => {
    console.log(`    - ${ncp.ncp_id}: ${ncp.status}`)
  })

  // Check what teamlead2 should see
  const teamlead2NCPs = db.prepare(`
    SELECT * FROM ncp_reports 
    WHERE assigned_team_leader = 'teamlead2' 
    AND status IN ('qa_approved', 'tl_processed')
  `).all()
  console.log(`  teamlead2 should see: ${teamlead2NCPs.length} NCPs`)
  teamlead2NCPs.forEach(ncp => {
    console.log(`    - ${ncp.ncp_id}: ${ncp.status}`)
  })

  console.log("\n✅ Workflow test completed!")

} catch (error) {
  console.error("❌ Error testing workflow:", error)
} finally {
  db.close()
}