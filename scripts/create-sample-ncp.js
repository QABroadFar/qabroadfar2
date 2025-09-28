const Database = require("better-sqlite3")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("📝 Creating sample NCP data...")

try {
  // Clear existing NCP reports
  db.prepare("DELETE FROM ncp_reports").run()
  console.log("🗑️ Cleared existing NCP reports")

  // Create sample NCP reports
  const sampleNCPs = [
    {
      ncp_id: "2401-0001",
      sku_code: "SKU001",
      machine_code: "MACH001",
      date: "2024-01-15",
      time_incident: "14:30",
      hold_quantity: 100,
      hold_quantity_uom: "pcs",
      problem_description: "Product defect found during quality check",
      photo_attachment: null,
      qa_leader: "qaleader1",
      status: "pending",
      submitted_by: "operator1"
    },
    {
      ncp_id: "2401-0002",
      sku_code: "SKU002",
      machine_code: "MACH002",
      date: "2024-01-16",
      time_incident: "09:15",
      hold_quantity: 50,
      hold_quantity_uom: "pcs",
      problem_description: "Packaging issue detected",
      photo_attachment: null,
      qa_leader: "qaleader1",
      status: "pending",
      submitted_by: "operator2"
    }
  ]

  const insertNCP = db.prepare(`
    INSERT INTO ncp_reports (
      ncp_id, sku_code, machine_code, date, time_incident, 
      hold_quantity, hold_quantity_uom, problem_description, 
      photo_attachment, qa_leader, status, submitted_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const ncp of sampleNCPs) {
    insertNCP.run(
      ncp.ncp_id,
      ncp.sku_code,
      ncp.machine_code,
      ncp.date,
      ncp.time_incident,
      ncp.hold_quantity,
      ncp.hold_quantity_uom,
      ncp.problem_description,
      ncp.photo_attachment,
      ncp.qa_leader,
      ncp.status,
      ncp.submitted_by
    )
    console.log(`📋 Created NCP: ${ncp.ncp_id}`)
  }

  console.log("✅ Sample NCP data created successfully!")

} catch (error) {
  console.error("❌ Error creating sample NCP data:", error)
} finally {
  db.close()
}