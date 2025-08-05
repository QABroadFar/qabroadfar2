const Database = require("better-sqlite3")
const bcrypt = require("bcryptjs")
const path = require("path")

// Connect to database
const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("🌱 Seeding database with test users...")

async function seedUsers() {
  try {
    // Test users with their roles and passwords
    const testUsers = [
      { username: "user1", password: "123", role: "user", fullName: "Test User 1" },
      { username: "qaleader1", password: "123", role: "qa_leader", fullName: "QA Leader 1" },
      { username: "teamlead1", password: "123", role: "team_leader", fullName: "Team Leader 1" },
      { username: "processlead1", password: "123", role: "process_lead", fullName: "Process Lead 1" },
      { username: "qamanager1", password: "123", role: "qa_manager", fullName: "QA Manager 1" },
      { username: "admin", password: "123", role: "admin", fullName: "Administrator" },
      // Additional test users
      { username: "q", password: "q", role: "admin", fullName: "Quick Admin" }, // For quick testing
    ]

    // Clear existing users (optional - remove this if you want to keep existing users)
    console.log("🗑️  Clearing existing users...")
    db.prepare("DELETE FROM users").run()

    // Insert test users
    const insertUser = db.prepare(`
      INSERT INTO users (username, password, role, full_name) 
      VALUES (?, ?, ?, ?)
    `)

    for (const user of testUsers) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10)

      try {
        insertUser.run(user.username, hashedPassword, user.role, user.fullName)
        console.log(`✅ Created user: ${user.username} (${user.role})`)
      } catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          console.log(`⚠️  User ${user.username} already exists, skipping...`)
        } else {
          console.error(`❌ Error creating user ${user.username}:`, error.message)
        }
      }
    }

    console.log("\n🎉 Database seeding completed!")
    console.log("\n📋 Test Credentials:")
    console.log("👤 User: user1/123")
    console.log("👨‍💼 QA Leader: qaleader1/123")
    console.log("👨‍🔧 Team Leader: teamlead1/123")
    console.log("🛡️ Process Lead: processlead1/123")
    console.log("👑 QA Manager: qamanager1/123")
    console.log("🔧 Admin: admin/123")
    console.log("⚡ Quick Admin: q/q")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    db.close()
  }
}

seedUsers()
