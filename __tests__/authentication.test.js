const Database = require("better-sqlite3")
const bcrypt = require("bcryptjs")
const path = require("path")

async function authenticateUser(username, password) {
  const dbPath = path.join(process.cwd(), "qa_portal.db")
  const db = new Database(dbPath)
  
  try {
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username)
    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.full_name,
    }
  } finally {
    db.close()
  }
}

async function testAuthentication() {
  console.log("🧪 Testing authentication functions...")
  
  // Test 1: Valid user authentication
  try {
    const user = await authenticateUser("teamlead2", "123")
    if (user) {
      console.log("✅ Valid user authentication successful")
      console.log(`   User: ${user.username} (${user.role})`)
    } else {
      console.log("❌ Valid user authentication failed")
    }
  } catch (error) {
    console.log("❌ Error in valid user authentication:", error.message)
  }
  
  // Test 2: Invalid username
  try {
    const user = await authenticateUser("nonexistent", "password123")
    if (user === null) {
      console.log("✅ Invalid username test passed")
    } else {
      console.log("❌ Invalid username test failed")
    }
  } catch (error) {
    console.log("❌ Error in invalid username test:", error.message)
  }
  
  // Test 3: Invalid password
  try {
    const user = await authenticateUser("teamlead2", "wrongpassword")
    if (user === null) {
      console.log("✅ Invalid password test passed")
    } else {
      console.log("❌ Invalid password test failed")
    }
  } catch (error) {
    console.log("❌ Error in invalid password test:", error.message)
  }
  
  console.log("🧪 Authentication tests completed!")
}

testAuthentication()