const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'qa_portal.db');
const backupFilePath = process.argv[2]; // Get backup file path from command line argument

if (!backupFilePath) {
  console.error('Please provide the path to the backup file to restore from.');
  process.exit(1);
}

if (!fs.existsSync(backupFilePath)) {
  console.error(`Backup file not found at: ${backupFilePath}`);
  process.exit(1);
}

fs.copyFileSync(backupFilePath, dbPath);

console.log(`Database restored from: ${backupFilePath}`);
