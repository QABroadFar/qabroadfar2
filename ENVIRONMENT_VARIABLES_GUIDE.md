# Configuring Environment Variables for Supabase

## Overview
This guide will help you configure the necessary environment variables for your Supabase integration.

## Required Environment Variables

You need to set the following environment variables in your application:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Find the following information:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)

## Local Development (.env.local)

Create a `.env.local` file in your project root with the following content:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Note: For local development, you typically don't need the service role key unless you're running server-side functions.

## Vercel Deployment

When deploying to Vercel, you need to set these environment variables in the Vercel dashboard:

1. Go to your Vercel project
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`, Value: your Supabase project URL
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Value: your Supabase anon key
   - Key: `SUPABASE_SERVICE_ROLE_KEY`, Value: your Supabase service role key

## Security Considerations

1. **Public vs Private Keys**:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are prefixed with `NEXT_PUBLIC_` because they are safe to expose to the client-side
   - `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client-side and should only be used in server-side code

2. **Environment-Specific Keys**:
   - Use different Supabase projects for development, staging, and production
   - Each environment should have its own set of keys

## Example Configuration Files

### .env.local (Development)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjI0NTQ0MDAwLCJleHAiOjE5NDAxMjAwMDB9.YourAnonKeyHere
```

### .env.production (If using different files)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvZHVjdGlvbi1wcm9qZWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjQ1NDQwMDAsImV4cCI6MTk0MDEyMDAwMH0.YourProductionAnonKeyHere
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvZHVjdGlvbi1wcm9qZWN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYyNDU0NDAwMCwiZXhwIjoxOTQwMTIwMDAwfQ.YourServiceRoleKeyHere
```

## Verifying Your Configuration

To verify your environment variables are set correctly, you can add a simple check in your application:

```typescript
// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Troubleshooting

### Common Issues

1. **"Missing environment variable" errors**:
   - Ensure your `.env.local` file is in the project root
   - Restart your development server after adding environment variables
   - Check for typos in variable names

2. **"Invalid URL" errors**:
   - Verify your Supabase project URL is correct
   - Ensure it includes the full URL including `https://`

3. **Authentication errors**:
   - Verify your anon key is correct
   - Check that your Supabase project is not paused

4. **Permission errors**:
   - Verify Row Level Security (RLS) policies are correctly configured
   - Ensure your user has the correct permissions

### Debugging Environment Variables

You can add temporary logging to verify your environment variables are loaded:

```typescript
// Only for debugging - remove in production!
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
```

Remember to remove this logging before deploying to production!

## Next Steps

After configuring your environment variables:
1. Test your application locally
2. Deploy to Vercel with the same environment variables
3. Monitor for any connection issues

If you encounter any issues, check:
1. The Supabase project status
2. Network connectivity
3. Firewall settings if applicable
4. The Supabase documentation for connection troubleshooting