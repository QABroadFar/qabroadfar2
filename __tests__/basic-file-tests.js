// Simple test script to check that required files exist
const fs = require('fs');
const path = require('path');

console.log('Running basic file existence tests...');

// Test that the database.ts file exists
const databasePath = path.join(__dirname, '../lib/database.ts');
if (fs.existsSync(databasePath)) {
  console.log('✓ lib/database.ts file exists');
} else {
  console.error('✗ lib/database.ts file does not exist');
  process.exit(1);
}

// Test that the login route file exists
const loginRoutePath = path.join(__dirname, '../app/api/auth/login/route.ts');
if (fs.existsSync(loginRoutePath)) {
  console.log('✓ app/api/auth/login/route.ts file exists');
} else {
  console.error('✗ app/api/auth/login/route.ts file does not exist');
  process.exit(1);
}

console.log('All basic tests passed!');