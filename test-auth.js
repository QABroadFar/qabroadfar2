import { authenticateUser } from "./lib/database"

async function testAuth() {
  try {
    // Test with a known user (you'll need to replace with actual credentials)
    const user = await authenticateUser("teamlead2", "your_new_password_here")
    console.log("Authentication result:", user)
  } catch (error) {
    console.error("Authentication error:", error)
  }
}

testAuth()