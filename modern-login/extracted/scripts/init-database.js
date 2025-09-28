const Database = require("better-sqlite3")
const bcrypt = require("bcryptjs")
const path = require("path")

const dbPath = path.join(process.cwd(), "qa_portal.db")
const db = new Database(dbPath)

console.log("🗄️ Initializing database...")

try {
  // Initialize database tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      full_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // NCP Reports table with extended fields for approval workflow
  db.exec(`
    CREATE TABLE IF NOT EXISTS ncp_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ncp_id TEXT UNIQUE NOT NULL,
      sku_code TEXT NOT NULL,
      machine_code TEXT NOT NULL,
      date TEXT NOT NULL,
      time_incident TEXT NOT NULL,
      hold_quantity INTEGER NOT NULL,
      hold_quantity_uom TEXT NOT NULL,
      problem_description TEXT NOT NULL,
      photo_attachment TEXT,
      qa_leader TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      submitted_by TEXT NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- QA Leader Approval Fields
      qa_approved_by TEXT,
      qa_approved_at DATETIME,
      disposisi TEXT,
      jumlah_sortir TEXT DEFAULT '0',
      jumlah_release TEXT DEFAULT '0',
      jumlah_reject TEXT DEFAULT '0',
      assigned_team_leader TEXT,
      qa_rejection_reason TEXT,
      
      -- Team Leader Fields
      tl_processed_by TEXT,
      tl_processed_at DATETIME,
      root_cause_analysis TEXT,
      corrective_action TEXT,
      preventive_action TEXT,
      
      -- Process Lead Fields
      process_approved_by TEXT,
      process_approved_at DATETIME,
      process_rejection_reason TEXT,
      process_comment TEXT,
      
      -- QA Manager Fields
      manager_approved_by TEXT,
      manager_approved_at DATETIME,
      manager_rejection_reason TEXT,
      manager_comment TEXT,
      
      -- Final status
      archived_at DATETIME
    )
  `)

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ncp_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `)

  console.log("✅ Database tables created successfully!")

  // Clear existing users
  db.prepare("DELETE FROM users").run()
  console.log("🗑️ Cleared existing users")

  // Seed users
  const users = [
    {
      username: "qaleader1",
      password: "password123",
      role: "qa_leader",
      full_name: "QA Leader 1"
    },
    {
      username: "teamlead1",
      password: "password123",
      role: "team_leader",
      full_name: "Team Leader 1"
    },
    {
      username: "processlead1",
      password: "password123",
      role: "process_lead",
      full_name: "Process Lead 1"
    },
    {
      username: "qamanager1",
      password: "password123",
      role: "qa_manager",
      full_name: "QA Manager 1"
    },
    {
      username: "admin",
      password: "password123",
      role: "admin",
      full_name: "Administrator"
    }
  ]

  const insertUser = db.prepare(`
    INSERT INTO users (username, password, role, full_name)
    VALUES (?, ?, ?, ?)
  `)

  for (const user of users) {
    const hashedPassword = bcrypt.hashSync(user.password, 10)
    insertUser.run(user.username, hashedPassword, user.role, user.full_name)
    console.log(`👤 Created user: ${user.username} (${user.role})`)
  }

  console.log("✅ Database initialization completed!")

} catch (error) {
  console.error("❌ Error initializing database:", error)
} finally {
  db.close()
}