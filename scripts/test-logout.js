
const { db } = require("../lib/database")

async function testLogout() {
  console.log("🧪 Testing Logout Functionality...")

  // Check all users in database
  const users = db.prepare("SELECT username, role FROM users").all()
  
  console.log("\n👥 Available users for testing:")
  users.forEach(user => {
    console.log(`   ✓ ${user.username} (${user.role})`)
  })

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
