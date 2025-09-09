# Manual Update Guide for API Routes to Use Supabase

## Overview
This guide will help you manually update your API routes to use the Supabase database instead of SQLite.

## Key Changes Needed

1. **Import Statements**: Change from `@/lib/database` to `@/lib/supabaseDatabase`
2. **Function Calls**: Add `await` keyword since Supabase functions are asynchronous
3. **Error Handling**: Ensure proper async/await error handling

## Example Updates

### Before (SQLite):
```typescript
import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getAllNCPReports } from "@/lib/database"

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const reports = getAllNCPReports()
    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching NCP reports:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
```

### After (Supabase):
```typescript
import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getAllNCPReports } from "@/lib/supabaseDatabase"

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const reports = await getAllNCPReports()
    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching NCP reports:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
```

## List of Files to Update

You need to update all files in the following directories:
1. `app/api/` - All API route files
2. `lib/` - Any library files that import from `@/lib/database`

## Specific Files to Update

### API Route Files
1. `app/api/ncp/list/route.ts` ✓ (Already updated)
2. `app/api/ncp/submit/route.ts`
3. `app/api/ncp/approve-process/route.ts`
4. `app/api/ncp/approve-manager/route.ts`
5. `app/api/ncp/process-tl/route.ts`
6. `app/api/ncp/[id]/reassign/route.ts`
7. `app/api/ncp/[id]/revert-status/route.ts`
8. `app/api/users/route.ts`
9. `app/api/system-logs/route.ts`
10. And all other API route files

### Library Files
1. `lib/database-functions.ts` (if it imports from `@/lib/database`)
2. Any other files that use database functions

## Update Process

For each file:

1. **Update Import Statements**:
   ```typescript
   // Before
   import { getAllUsers, createUser } from "@/lib/database"
   
   // After
   import { getAllUsers, createUser } from "@/lib/supabaseDatabase"
   ```

2. **Add Await Keywords**:
   ```typescript
   // Before
   const users = getAllUsers()
   
   // After
   const users = await getAllUsers()
   ```

3. **Ensure Async/Await Pattern**:
   ```typescript
   // Before
   export function GET() {
     const users = getAllUsers()
     return NextResponse.json(users)
   }
   
   // After
   export async function GET() {
     const users = await getAllUsers()
     return NextResponse.json(users)
   }
   ```

## Common Functions That Need Await

Make sure to add `await` to these function calls:
- `authenticateUser()`
- `getAllUsers()`
- `getUsersByRole()`
- `updateUserRole()`
- `createUser()`
- `deleteUser()`
- `updateUserPassword()`
- `updateUserStatus()`
- `createNCPReport()`
- `getAllNCPReports()`
- `getNCPReportsForUser()`
- `getPendingNCPsForRole()`
- `getNCPById()`
- `approveNCPByQALeader()`
- `rejectNCPByQALeader()`
- `processNCPByTeamLeader()`
- `approveNCPByProcessLead()`
- `rejectNCPByProcessLead()`
- `approveNCPByQAManager()`
- `rejectNCPByQAManager()`
- `createNotification()`
- `createNotificationForRole()`
- `getNotificationsForUser()`
- `getUnreadNotificationCount()`
- `markNotificationAsRead()`
- `markAllNotificationsAsRead()`
- `getNCPStatistics()`
- `getNCPStatisticsForRole()`
- `getSystemSetting()`
- `setSystemSetting()`
- `getAllSKUCodes()`
- `createSKUCode()`
- `updateSKUCode()`
- `deleteSKUCode()`
- `getAllMachines()`
- `createMachine()`
- `updateMachine()`
- `deleteMachine()`
- `getAllUOMs()`
- `createUOM()`
- `updateUOM()`
- `deleteUOM()`
- `logNCPChange()`
- `getAuditLog()`
- `logSystemEvent()`
- `getSystemLogs()`
- `getApiKeys()`
- `createApiKey()`
- `deleteApiKey()`
- `superEditNCP()`
- `revertNCPStatus()`
- `reassignNCP()`
- `deleteNCPReport()`
- `getNCPsByMonth()`
- `getAverageApprovalTime()`
- `getNCPStatusDistribution()`
- `getNCPsByTopSubmitters()`

## Testing Your Updates

After updating each file:
1. Run your development server: `npm run dev`
2. Test the specific functionality related to that API route
3. Check the browser console and server logs for any errors

## Troubleshooting

### Common Issues

1. **"getAllUsers is not a function"**:
   - Make sure you've updated the import statement
   - Check that you're importing from `@/lib/supabaseDatabase`

2. **"Unexpected token 'await'"**:
   - Make sure your function is marked as `async`
   - Make sure you're using `await` correctly

3. **"Cannot read property 'then' of undefined"**:
   - Make sure you're not trying to use `.then()` on a function that already uses `await`

4. **Authentication issues**:
   - Verify your Supabase credentials are correct
   - Check that your environment variables are set properly

## Next Steps

After updating all API routes:
1. Configure environment variables for Supabase
2. Test the entire application
3. Deploy to Vercel