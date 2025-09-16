const Database = require('better-sqlite3');

// Database connection
const db = new Database("qa_portal.db");

console.log('Checking users in database...');
try {
  const users = db.prepare("SELECT * FROM users").all();
  console.log('All users:');
  console.table(users);
  
  const superAdmin = db.prepare("SELECT * FROM users WHERE role = 'super_admin'").all();
  console.log('Super admin users:');
  console.table(superAdmin);
  
  const superadmin = db.prepare("SELECT * FROM users WHERE role = 'superadmin'").all();
  console.log('Superadmin users (without underscore):');
  console.table(superadmin);
} catch (error) {
  console.error('Error checking database:', error);
}