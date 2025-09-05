const Database = require("better-sqlite3")
const path = require("path")

function getNCPReports() {
  const dbPath = path.join(process.cwd(), "qa_portal.db")
  const db = new Database(dbPath)
  
  try {
    const reports = db.prepare("SELECT * FROM ncp_reports ORDER BY submitted_at DESC LIMIT 5").all()
    return reports
  } finally {
    db.close()
  }
}

function getPendingNCPs() {
  const dbPath = path.join(process.cwd(), "qa_portal.db")
  const db = new Database(dbPath)
  
  try {
    const reports = db.prepare("SELECT * FROM ncp_reports WHERE status = 'pending' ORDER BY submitted_at ASC").all()
    return reports
  } finally {
    db.close()
  }
}

function testNCPFunctions() {
  console.log("🧪 Testing NCP functions...")
  
  // Test 1: Get NCP reports
  try {
    const reports = getNCPReports()
    console.log(`✅ Successfully retrieved ${reports.length} NCP reports`)
    if (reports.length > 0) {
      console.log(`   Latest report: ${reports[0].ncp_id} (${reports[0].status})`)
    }
  } catch (error) {
    console.log("❌ Error retrieving NCP reports:", error.message)
  }
  
  // Test 2: Get pending NCPs
  try {
    const pendingReports = getPendingNCPs()
    console.log(`✅ Successfully retrieved ${pendingReports.length} pending NCPs`)
  } catch (error) {
    console.log("❌ Error retrieving pending NCPs:", error.message)
  }
  
  console.log("🧪 NCP function tests completed!")
}

testNCPFunctions()