import { createUser } from "@/lib/database"
import Database from "better-sqlite3"

// Initialize database connection
const db = new Database("qa_portal.db")

// Users to create
const usersToCreate = [
  { username: "qaleader2", password: "password123", role: "qa_leader", fullName: "QA Leader 2" },
  { username: "teamlead2", password: "password123", role: "team_leader", fullName: "Team Leader 2" },
  { username: "teamlead3", password: "password123", role: "team_leader", fullName: "Team Leader 3" }
]

async function createMissingUsers() {
  for (const user of usersToCreate) {
    try {
      // Check if user already exists
      const existingUser = db.prepare("SELECT id FROM users WHERE username = ?").get(user.username)
      
      if (!existingUser) {
        console.log(`Creating user: ${user.username}`)
        const result = createUser(user.username, user.password, user.role, user.fullName)
        console.log(`User ${user.username} created successfully with ID: ${result.lastInsertRowid}`)
      } else {
        console.log(`User ${user.username} already exists`)
      }
    } catch (error) {
      console.error(`Error creating user ${user.username}:`, error)
    }
  }
}

createMissingUsers()
.then(() => console.log("Finished creating missing users"))
.catch(error => console.error("Error:", error))