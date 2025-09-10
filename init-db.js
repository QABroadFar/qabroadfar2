const Database = require('better-sqlite3');

// Database schema and connection
const db = new Database("qa_portal.db");

// Initialize database tables (called only if tables don't exist)
function initializeDatabase() {
  // Check if tables exist
  const tablesExist = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  if (tablesExist) {
    console.log('Database already initialized');
    return;
  }

  console.log('Initializing database...');

  // Create settings table for system configurations
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      description TEXT
    )
  `);

  // Create SKU codes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sku_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create machines table
  db.exec(`
    CREATE TABLE IF NOT EXISTS machines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create UOMs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS uoms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      full_name TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

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
  `);

  // NCP Audit Log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ncp_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ncp_id TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      field_changed TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      description TEXT
    )
  `);

  // System Logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // API Keys table
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      service_name TEXT NOT NULL,
      permissions TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME,
      is_active BOOLEAN DEFAULT TRUE
    )
  `);

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
  `);

  console.log('Database initialized successfully');
}

try {
  initializeDatabase();
} catch (error) {
  console.error('Error initializing database:', error);
}