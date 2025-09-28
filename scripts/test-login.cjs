const Database = require("better-sqlite3")
const bcrypt = require("bcryptjs")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

async function testLogin(username, password) {
  console.log(`\n🔍 Testing login for: ${username}`)
  
  try {
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username)
    
    if (!user) {
      console.log(`❌ User ${username} not found in database`)
      return false
    }
    
    console.log(`✅ User found: ${user.username} (${user.role})`)
    console.log(`🔐 Stored password hash: ${user.password.substring(0, 20)}...`)
    
    const isValid = await bcrypt.compare(password, user.password)
    console.log(`🔑 Password validation: ${isValid ? '✅ VALID' : '❌ INVALID'}`)
    
    return isValid
  } catch (error) {
    console.error(`❌ Error testing login for ${username}:`, error)
    return false
  }
}

async function runTests() {
  console.log("🧪 Testing authentication for all users...")
  
  const testCredentials = [
    { username: "q", password: "q" },
    { username: "user1", password: "123" },
    { username: "qaleader1", password: "123" },
    { username: "teamlead1", password: "123" },
    { username: "admin", password: "123" }
  ]
  
  for (const cred of testCredentials) {
    await testLogin(cred.username, cred.password)
  }
  
  db.close()
}

runTests()
