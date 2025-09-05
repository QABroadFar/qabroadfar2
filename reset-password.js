// Script to reset teamlead2 password to a known value
import Database from "better-sqlite3"
import { hashSync } from "bcryptjs"

const db = new Database("qa_portal.db")

// Reset teamlead2 password to "password123"
const newPassword = "password123"
const hashedPassword = hashSync(newPassword, 10)

const stmt = db.prepare("UPDATE users SET password = ? WHERE username = ?")
const result = stmt.run(hashedPassword, "teamlead2")

console.log("Password reset result:", result)
console.log("Password for teamlead2 has been reset to:", newPassword)