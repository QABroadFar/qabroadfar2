# Updating Your Application Code to Use Supabase

## Overview
This guide will help you update your application code to use the new Supabase database layer instead of the SQLite implementation.

## 1. Install Supabase Client

First, install the Supabase client library:

```bash
npm install @supabase/supabase-js
# or
pnpm install @supabase/supabase-js
```

## 2. Update Imports

Replace imports of the old database functions with the new Supabase database functions:

### Before (SQLite):
```typescript
import { 
  authenticateUser, 
  getAllUsers, 
  createNCPReport,
  // ... other functions
} from '@/lib/database'
```

### After (Supabase):
```typescript
import { 
  authenticateUser, 
  getAllUsers, 
  createNCPReport,
  // ... other functions
} from '@/lib/supabaseDatabase'
```

## 3. Update API Routes

Update your API routes to use the new Supabase functions. The main change is that Supabase functions are asynchronous, so you'll need to use `await`.

### Before (SQLite):
```typescript
// pages/api/users/index.ts
import { getAllUsers } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const users = getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
```

### After (Supabase):
```typescript
// pages/api/users/index.ts
import { getAllUsers } from '@/lib/supabaseDatabase'

export async function GET(request: NextRequest) {
  try {
    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
```

## 4. Update Components

Similarly, update your components to use the new asynchronous functions:

### Before (SQLite):
```typescript
// components/UserList.tsx
import { getAllUsers } from '@/lib/database'
import { useEffect, useState } from 'react'

export function UserList() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = () => {
      const userData = getAllUsers()
      setUsers(userData)
    }
    fetchUsers()
  }, [])

  // ... rest of component
}
```

### After (Supabase):
```typescript
// components/UserList.tsx
import { getAllUsers } from '@/lib/supabaseDatabase'
import { useEffect, useState } from 'react'

export function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getAllUsers()
        setUsers(userData)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // ... rest of component
}
```

## 5. Update Environment Variables

Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard:
1. Go to Settings > API
2. Copy the Project URL and anon public key

## 6. Common API Route Updates

Here are examples of how to update common API routes:

### Authentication Route
```typescript
// pages/api/auth/login.ts
import { authenticateUser } from '@/lib/supabaseDatabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    const user = await authenticateUser(username, password)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Create session/token logic here
    
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
```

### NCP Submission Route
```typescript
// pages/api/ncp/submit.ts
import { createNCPReport } from '@/lib/supabaseDatabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { username } = getUsernameFromToken(request) // Your auth logic
    
    const result = await createNCPReport(data, username)
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create NCP report' }, { status: 500 })
  }
}
```

## 7. Testing Your Updates

After updating your code:

1. Run your development server:
   ```bash
   npm run dev
   ```

2. Test all functionality:
   - User authentication
   - NCP report creation
   - Approval workflows
   - Data viewing

3. Check the browser console and server logs for any errors

## 8. Handling Errors

The Supabase implementation throws errors instead of returning empty results, so make sure to handle them appropriately:

```typescript
try {
  const users = await getAllUsers()
  setUsers(users)
} catch (error) {
  console.error('Failed to fetch users:', error)
  // Show error message to user
}
```

## 9. Removing Old Code

Once you've confirmed everything is working with Supabase:

1. You can remove the old `lib/database.ts` file
2. Remove the `better-sqlite3` dependency from your package.json:
   ```bash
   npm uninstall better-sqlite3
   # or
   pnpm remove better-sqlite3
   ```

## 10. Next Steps

After updating your application code:
1. Test thoroughly locally
2. Configure environment variables in Vercel
3. Deploy to Vercel
4. Monitor for any issues

If you encounter any issues during the update process, refer to:
- The Supabase documentation: https://supabase.com/docs
- Your original SQLite implementation for comparison
- The TypeScript types in the new Supabase database layer