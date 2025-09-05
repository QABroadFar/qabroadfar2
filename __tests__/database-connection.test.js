const Database = require("better-sqlite3")
const bcrypt = require("bcryptjs")
const path = require("path")

// Test database functions
console.log("🧪 Testing database functions...")

// Test 1: Check that the database file exists and can be opened
try {
  const dbPath = path.join(process.cwd(), "qa_portal.db")
  const db = new Database(dbPath)
  console.log("✅ Database connection successful")
  
  // Test 2: Check that the users table exists
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get()
  if (tableExists) {
    console.log("✅ Users table exists")
  } else {
    console.log("❌ Users table does not exist")
  }
  
  // Test 3: Check that we can query users
  try {
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get()
    console.log(`✅ Users table contains ${userCount.count} users`)
  } catch (error) {
    console.log("❌ Error querying users table:", error.message)
  }
  
  // Test 4: Check that the ncp_reports table exists
  const ncpTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ncp_reports'").get()
  if (ncpTableExists) {
    console.log("✅ NCP reports table exists")
  } else {
    console.log("❌ NCP reports table does not exist")
  }
  
  db.close()
} catch (error) {
  console.log("❌ Database connection failed:", error.message)
}

console.log("🧪 Testing database functions completed!")