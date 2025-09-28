const Database = require("better-sqlite3")
const path = require("path")

// Connect to database
const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("Updating database schema...")

try {
  // Add missing columns if they don't exist
  const alterQueries = [
    `ALTER TABLE ncp_reports ADD COLUMN jumlah_sortir TEXT DEFAULT '0'`,
    `ALTER TABLE ncp_reports ADD COLUMN jumlah_release TEXT DEFAULT '0'`,
    `ALTER TABLE ncp_reports ADD COLUMN jumlah_reject TEXT DEFAULT '0'`,
    `ALTER TABLE ncp_reports ADD COLUMN process_approved_by TEXT`,
    `ALTER TABLE ncp_reports ADD COLUMN process_approved_at DATETIME`,
    `ALTER TABLE ncp_reports ADD COLUMN process_rejection_reason TEXT`,
    `ALTER TABLE ncp_reports ADD COLUMN process_comment TEXT`,
  ]

  for (const query of alterQueries) {
    try {
      db.exec(query)
      console.log("✅ Added column successfully")
    } catch (error) {
      if (error.message.includes("duplicate column name")) {
        console.log("⚠️  Column already exists, skipping...")
      } else {
        console.log("❌ Error:", error.message)
      }
    }
  }

  // Update existing records to have default values
  const updateQuery = `
    UPDATE ncp_reports SET 
      jumlah_sortir = COALESCE(jumlah_sortir, '0'),
      jumlah_release = COALESCE(jumlah_release, '0'), 
      jumlah_reject = COALESCE(jumlah_reject, '0')
    WHERE jumlah_sortir IS NULL OR jumlah_release IS NULL OR jumlah_reject IS NULL
  `

  const result = db.prepare(updateQuery).run()
  console.log(`✅ Updated ${result.changes} existing records with default values`)

  console.log("🎉 Database schema update completed successfully!")
} catch (error) {
  console.error("❌ Error updating database:", error)
} finally {
  db.close()
}
