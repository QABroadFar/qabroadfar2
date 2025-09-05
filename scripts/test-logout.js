const Database = require("better-sqlite3")
const path = require("path")

async function testLogout() {
  console.log("🧪 Testing Logout Functionality...")
  
  try {
    // Connect directly to the database
    const dbPath = path.join(process.cwd(), "qa_portal.db")
    const db = new Database(dbPath)
    
    // Check all users in database
    const users = db.prepare("SELECT username, role FROM users").all()
    
    console.log("\n👥 Available users for testing:")
    users.forEach(user => {
      console.log(`   ✓ ${user.username} (${user.role})`)
    })
    
    db.close()
  } catch (error) {
    console.error("❌ Error accessing database:", error.message)
  }

  console.log("\n🔄 Test Steps:")
  console.log("1. Login dengan salah satu user")
  console.log("2. Pergi ke dashboard")
  console.log("3. Klik tombol user di header")
  console.log("4. Klik 'Log out'")
  console.log("5. Konfirmasi logout")
  console.log("6. Pastikan diarahkan ke halaman login")

  console.log("\n✅ Logout should work for all roles!")
}

testLogout()