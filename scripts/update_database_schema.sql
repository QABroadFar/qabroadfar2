-- Add missing columns if they don't exist
ALTER TABLE ncp_reports ADD COLUMN IF NOT EXISTS jumlah_sortir TEXT;
ALTER TABLE ncp_reports ADD COLUMN IF NOT EXISTS jumlah_release TEXT;
ALTER TABLE ncp_reports ADD COLUMN IF NOT EXISTS jumlah_reject TEXT;
ALTER TABLE ncp_reports ADD COLUMN IF NOT EXISTS process_approved_by TEXT;
ALTER TABLE ncp_reports ADD COLUMN IF NOT EXISTS process_approved_at DATETIME;
ALTER TABLE ncp_reports ADD COLUMN IF NOT EXISTS process_rejection_reason TEXT;
ALTER TABLE ncp_reports ADD COLUMN IF NOT EXISTS process_comment TEXT;

-- Update any existing test data to have the new fields
UPDATE ncp_reports SET 
  jumlah_sortir = '0',
  jumlah_release = '0', 
  jumlah_reject = '0'
WHERE jumlah_sortir IS NULL;
