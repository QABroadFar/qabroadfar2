const Database = require("better-sqlite3")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("📋 Checking users in database...")

try {
  const users = db.prepare("SELECT id, username, role, full_name FROM users").all()
  
  console.log(`\n👥 Found ${users.length} users:`)
  users.forEach(user => {
    console.log(`  - ${user.username} (${user.role}) - ${user.full_name}`)
  })
  
  if (users.length === 0) {
    console.log("❌ No users found in database!")
  }
  
  // Also check if passwords are properly hashed
  const userWithPassword = db.prepare("SELECT username, password FROM users LIMIT 1").get()
  if (userWithPassword) {
    console.log(`\n🔐 Password hash example: ${userWithPassword.password.substring(0, 20)}...`)
  }
} catch (error) {
  console.error("❌ Error checking users:", error)
} finally {
  db.close()
}
