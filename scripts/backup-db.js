const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'qa_portal.db');
const backupDir = path.join(process.cwd(), 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `qa_portal-backup-${timestamp}.db`);

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

fs.copyFileSync(dbPath, backupPath);

console.log(`Database backup created at: ${backupPath}`);
