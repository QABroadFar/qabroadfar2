qwem// vercel-deploy-guide.md
// Complete guide for deploying to Vercel

# 🚀 Vercel Deployment Guide

## Prerequisites
1. Vercel account (https://vercel.com)
2. GitHub account connected to Vercel
3. Supabase project already created and configured

## Step 1: Prepare Environment Variables

You'll need to set these environment variables in your Vercel project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qddwkuutcikimuuwplnd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZHdrdXV0Y2lraW11dXdwbG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDg3NzUsImV4cCI6MjA3Mjk4NDc3NX0.nwQJmJqMr6SQyetUZUOsAKu4PLaJa9XCQbzW5UqFg1Q
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZHdrdXV0Y2lraW11dXdwbG5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQwODc3NSwiZXhwIjoyMDcyOTg0Nzc1fQ.ikT_LlgFHhuD4CPWBOLk13XwjjfAlvi9Wt9SfIa8uhY

# JWT Secret (same as used in development)
JWT_SECRET=hcE+tljMevsQuJ//kGmw15D97B2wYLrqyoqNiuNlFFnOlhJtpJz+eqikVybEkS5YFpTzOEM1ksnC8AI/Mc8yjQ==

# Optional (for production)
NODE_ENV=production
```

## Step 2: Vercel Project Setup

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your Git repository
4. Configure project settings:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: `next build`
   - Output Directory: `.next`

## Step 3: Environment Variables Configuration

In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the variables listed above
4. **Important**: Set `SUPABASE_SERVICE_ROLE_KEY` as a "Sensitive" variable

## Step 4: Build and Deploy Process

Vercel will automatically:
1. Install dependencies (`npm install`)
2. Build the application (`next build`)
3. Deploy to a preview URL
4. Promote to production after verification

## Step 5: Post-Deployment Verification

After deployment:
1. Test all API endpoints
2. Verify database connections
3. Check authentication flow
4. Validate all user roles work correctly
```