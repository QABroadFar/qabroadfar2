const Database = require("better-sqlite3")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("Verifying database schema...")

try {
  // Get table info
  const tableInfo = db.prepare("PRAGMA table_info(ncp_reports)").all()

  const requiredColumns = [
    "jumlah_sortir",
    "jumlah_release",
    "jumlah_reject",
    "process_approved_by",
    "process_approved_at",
    "process_rejection_reason",
    "process_comment",
  ]

  console.log("\n📋 Checking required columns:")

  for (const column of requiredColumns) {
    const exists = tableInfo.some((col) => col.name === column)
    console.log(`${exists ? "✅" : "❌"} ${column}: ${exists ? "EXISTS" : "MISSING"}`)
  }

  console.log("\n🔍 Current table structure:")
  tableInfo.forEach((col) => {
    console.log(`  - ${col.name} (${col.type})`)
  })
} catch (error) {
  console.error("❌ Error verifying database:", error)
} finally {
  db.close()
}
