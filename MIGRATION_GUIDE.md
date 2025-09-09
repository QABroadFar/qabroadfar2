# SQLite to Supabase Migration Guide

## Overview
This guide will help you migrate your SQLite database to Supabase so you can deploy your application to Vercel.

## Prerequisites
1. A Supabase account (free tier available at supabase.com)
2. SQLite database with your current data
3. Command line access to your system

## Step-by-Step Migration Process

### 1. Create Supabase Project
1. Go to https://supabase.com and sign up or log in
2. Click "New Project"
3. Enter project details:
   - Name: Choose a name for your project
   - Database Password: Set a strong password
   - Region: Choose the region closest to your users
4. Click "Create Project" and wait for provisioning (may take a few minutes)

### 2. Get Supabase Credentials
After your project is created, navigate to:
1. Project Settings > API
2. Note down:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)

### 3. Create Database Schema in Supabase
1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to create all tables

### 4. Export Data from SQLite
Run the following command in your terminal from the project directory:
```bash
sqlite3 qa_portal.db < sqlite-export.sql
```

This will create CSV files for each table in your current directory.

### 5. Convert Data for PostgreSQL
The main differences you need to handle:
1. Boolean values: SQLite uses 0/1, PostgreSQL uses true/false
2. Date formats: Ensure dates are in ISO format (YYYY-MM-DD)
3. NULL values: Handle appropriately

### 6. Import Data to Supabase
You have several options:

#### Option A: Using CSV Import (Easiest)
1. In Supabase dashboard, go to Table Editor
2. For each table, click "Insert" then "Import Data"
3. Upload the corresponding CSV file
4. Map columns as needed
5. Click "Import"

#### Option B: Using SQL INSERT Statements
1. Modify `supabase-import.sql` with your actual data
2. Run the script in Supabase SQL Editor

#### Option C: Using Supabase CLI (Advanced)
1. Install Supabase CLI: `npm install -g supabase`
2. Link your project: `supabase link --project-ref YOUR_PROJECT_ID`
3. Push your schema: `supabase db push`
4. Import data using `supabase db reset` with seed data

### 7. Verify Data Migration
1. In Supabase Table Editor, check that all tables have the correct data
2. Run some sample queries to verify data integrity

## Important Considerations

### Data Type Conversions
| SQLite Type | PostgreSQL Type | Notes |
|-------------|-----------------|-------|
| INTEGER | INTEGER | Same |
| TEXT | TEXT | Same |
| DATETIME | TIMESTAMPTZ | Include timezone info |
| BOOLEAN (0/1) | BOOLEAN (true/false) | Convert values |

### Security Considerations
1. In Supabase, Row Level Security (RLS) is enabled by default
2. You may need to adjust the policies in `supabase-schema.sql` based on your application's requirements
3. Never expose the service_role key in client-side code

### Sequence Handling
After importing data with specific IDs, reset the sequences:
```sql
SELECT setval('table_name_id_seq', (SELECT MAX(id) FROM table_name));
```

## Troubleshooting

### Common Issues
1. **Date format errors**: Ensure all dates are in ISO format
2. **Boolean conversion**: Make sure 0/1 values are converted to false/true
3. **Foreign key constraints**: Import tables in the correct order (referenced tables first)
4. **Unique constraint violations**: Check for duplicate data

### Order of Table Creation
Import tables in this order to respect foreign key constraints:
1. system_settings
2. sku_codes
3. machines
4. uoms
5. users
6. ncp_reports
7. ncp_audit_log
8. system_logs
9. api_keys
10. notifications

## Next Steps
After successfully migrating your data:
1. Update your application code to use Supabase client instead of SQLite
2. Configure environment variables in Vercel
3. Test your application thoroughly
4. Deploy to Vercel

## Need Help?
If you encounter any issues during the migration:
1. Check the Supabase documentation: https://supabase.com/docs
2. Visit the Supabase Discord community: https://discord.supabase.com
3. Review the project's existing SQLite implementation for reference