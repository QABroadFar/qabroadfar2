const fs = require('fs');
const path = require('path');

console.log("🧪 Testing API routes...");

// Test that the login API route file exists
const loginRoutePath = path.join(__dirname, '../app/api/auth/login/route.ts');
if (fs.existsSync(loginRoutePath)) {
  console.log("✅ Login API route file exists");
  
  // Read the file content
  const content = fs.readFileSync(loginRoutePath, 'utf8');
  
  // Test that it exports a POST function
  if (content.includes('export async function POST')) {
    console.log("✅ POST function is exported");
  } else {
    console.log("❌ POST function is not exported");
  }
  
  // Test that it imports required modules
  if (content.includes('import { type NextRequest, NextResponse }')) {
    console.log("✅ Next.js request/response types are imported");
  } else {
    console.log("❌ Next.js request/response types are not imported");
  }
  
  if (content.includes('authenticateUser')) {
    console.log("✅ authenticateUser function is used");
  } else {
    console.log("❌ authenticateUser function is not used");
  }
} else {
  console.log("❌ Login API route file does not exist");
}

console.log("🧪 API route tests completed!");