const Database = require("better-sqlite3")
const bcrypt = require("bcryptjs")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("👥 Adding missing team leader users...")

try {
  // Check if users already exist
  const existingUsers = db.prepare("SELECT username FROM users WHERE username IN (?, ?)").all("teamlead2", "teamlead3")
  const existingUsernames = existingUsers.map(u => u.username)
  
  const usersToAdd = [
    {
      username: "teamlead2",
      password: "password123",
      role: "team_leader",
      full_name: "Team Leader 2"
    },
    {
      username: "teamlead3",
      password: "password123",
      role: "team_leader",
      full_name: "Team Leader 3"
    }
  ].filter(user => !existingUsernames.includes(user.username))

  if (usersToAdd.length === 0) {
    console.log("✅ All team leader users already exist!")
    return
  }

  const insertUser = db.prepare(`
    INSERT INTO users (username, password, role, full_name)
    VALUES (?, ?, ?, ?)
  `)

  for (const user of usersToAdd) {
    const hashedPassword = bcrypt.hashSync(user.password, 10)
    insertUser.run(user.username, hashedPassword, user.role, user.full_name)
    console.log(`👤 Created user: ${user.username} (${user.role})`)
  }

  console.log("✅ Missing team leader users added successfully!")

} catch (error) {
  console.error("❌ Error adding users:", error)
} finally {
  db.close()
}