const Database = require('better-sqlite3');

// Database connection
const db = new Database("qa_portal.db");

// Check if sku_codes table exists
try {
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sku_codes'").get();
  if (tableExists) {
    console.log('Table sku_codes exists');
    
    // Check table structure
    const tableInfo = db.prepare("PRAGMA table_info(sku_codes)").all();
    console.log('Table structure:');
    console.table(tableInfo);
    
    // Check if we can insert data
    const stmt = db.prepare("INSERT INTO sku_codes (code, description) VALUES (?, ?)");
    const result = stmt.run('TEST001', 'Test SKU Code');
    console.log('Insert test result:', result);
    
    // Check if we can select data
    const rows = db.prepare("SELECT * FROM sku_codes").all();
    console.log('Data in table:');
    console.table(rows);
    
    // Clean up test data
    const deleteStmt = db.prepare("DELETE FROM sku_codes WHERE code = ?");
    deleteStmt.run('TEST001');
    console.log('Test data cleaned up');
  } else {
    console.log('Table sku_codes does not exist');
  }
} catch (error) {
  console.error('Error checking database:', error);
}