# Important Files to Keep After Migration

## Core Application Files

### Database Layer
1. `lib/supabaseClient.ts` - Supabase client initialization
2. `lib/supabaseDatabase.ts` - Supabase database functions (replaces `lib/database.ts`)

### Environment Configuration
3. `.env` - Environment variables for local development
4. `.env.production` - Environment variables for production deployment

### Documentation
5. `SUPABASE_MIGRATION_DOCUMENTATION.md` - Complete migration guide
6. `API_ROUTES_UPDATE_SUMMARY.md` - Summary of API route updates
7. `MANUAL_UPDATE_GUIDE.md` - Instructions for manual updates (if needed)
8. `MIGRATION_COMPLETE.md` - Final migration confirmation
9. `README_UPDATED.md` - Updated README with Supabase information

### Database Schema
10. `supabase-schema-full.sql` - Complete database schema (for reference)

## Files That Can Be Removed After Verification

### Old SQLite Implementation
- `lib/database.ts` - Old SQLite database implementation (replaced by supabaseDatabase.ts)
- `lib/database-functions.ts` - Additional SQLite functions

### SQLite Database File
- `qa_portal.db` - Old SQLite database file

### SQLite Dependencies
After verifying everything works correctly, you can remove the SQLite dependency:
```bash
npm uninstall better-sqlite3
```

## Deployment Checklist

Before deploying to Vercel:
- [ ] Verify all API routes work correctly in development
- [ ] Test authentication and authorization
- [ ] Check data display and form submissions
- [ ] Verify all user roles work as expected
- [ ] Confirm environment variables are set correctly in Vercel dashboard

## Vercel Environment Variables

Set these in your Vercel project dashboard:
1. `NEXT_PUBLIC_SUPABASE_URL` = https://qddwkuutcikimuuwplnd.supabase.co
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZHdrdXV0Y2lraW11dXdwbG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDg3NzUsImV4cCI6MjA3Mjk4NDc3NX0.nwQJmJqMr6SQyetUZUOsAKu4PLaJa9XCQbzW5UqFg1Q
3. `JWT_SECRET` = your-super-secret-jwt-key
4. `SUPABASE_SERVICE_ROLE_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZHdrdXV0Y2lraW11dXdwbG5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQwODc3NSwiZXhwIjoyMDcyOTg0Nzc1fQ.ikT_LlgFHhuD4CPWBOLk13XwjjfAlvi9Wt9SfIa8uhY (set as a secret)

## Support Resources

- **Supabase Dashboard**: https://app.supabase.com/project/qddwkuutcikimuuwplnd
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs