# Quality Assurance Portal Documentation

Last Updated: September 9, 2025

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Installation](#installation)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [User Roles and Permissions](#user-roles-and-permissions)
8. [Workflow](#workflow)
9. [API Documentation](#api-documentation)
10. [Components](#components)
11. [Development Guidelines](#development-guidelines)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

## System Overview

The Quality Assurance Portal is a comprehensive system designed to manage Non-Conformance Product (NCP) reports throughout their lifecycle. The system provides a structured workflow for identifying, reviewing, processing, and approving quality issues in a manufacturing environment.

### Key Features
- Multi-role user management with role-based access control
- Complete NCP workflow from submission to final approval
- Real-time notifications and status tracking
- Comprehensive reporting and analytics
- Audit trail for all system activities
- Super Admin capabilities for system management

## Architecture

The system follows a modern web application architecture with cloud-based database:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js API  │◄──►│   (Supabase     │
│                 │    │    Routes)      │    │   PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Library    │    │   Business      │    │   Data Models   │
│   (shadcn/ui)   │    │   Logic         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Typed JavaScript for better code quality
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library built with Radix UI
- **Lucide React** - Icon library
- **Recharts** - Charting library for data visualization

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Supabase** - Cloud-based PostgreSQL database with real-time capabilities
- **Supabase Auth** - Authentication and authorization system
- **Supabase Storage** - File storage for attachments
- **Bcrypt.js** - Password hashing
- **Jose** - JWT handling

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **Vercel** - Deployment platform

## Installation

### Prerequisites
- Node.js 18+
- npm or pnpm package manager
- Git for version control
- Supabase account (free tier available)

### Setup Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd qabroadfar2
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your-super-secret-jwt-key
```

5. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
qabroadfar2/
├── app/                    # App Router pages and components
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard components
│   ├── login/             # Login page
│   └── superadmin/        # Super Admin features
├── components/            # Shared UI components
├── lib/                   # Utility functions and business logic
├── public/                # Static assets
├── styles/                # Global styles
├── docs/                  # Documentation
├── .next/                 # Next.js build output
├── node_modules/          # Dependencies
├── .env.local            # Environment variables
├── .gitignore            # Git ignore rules
├── next.config.mjs       # Next.js configuration
├── package.json          # Project dependencies
├── pnpm-lock.yaml        # Dependency lock file
├── postcss.config.mjs    # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Database Schema

### Database Migration Status
✅ **Migrated from SQLite to Supabase PostgreSQL**
✅ **All data successfully transferred**
✅ **Cloud-based scalability and reliability**
✅ **Real-time capabilities enabled**

### Supabase Tables

1. **users** - User accounts and roles
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  full_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. **ncp_reports** - Non-Conformance Product reports with complete workflow fields
```sql
CREATE TABLE ncp_reports (
  id SERIAL PRIMARY KEY,
  ncp_id TEXT UNIQUE NOT NULL,
  sku_code TEXT NOT NULL,
  machine_code TEXT NOT NULL,
  date DATE NOT NULL,
  time_incident TEXT NOT NULL,
  hold_quantity INTEGER NOT NULL,
  hold_quantity_uom TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  photo_attachment TEXT,
  qa_leader TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  submitted_by TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- QA Leader Approval Fields
  qa_approved_by TEXT,
  qa_approved_at TIMESTAMPTZ,
  disposisi TEXT,
  jumlah_sortir TEXT DEFAULT '0',
  jumlah_release TEXT DEFAULT '0',
  jumlah_reject TEXT DEFAULT '0',
  assigned_team_leader TEXT,
  qa_rejection_reason TEXT,

  -- Team Leader Fields
  tl_processed_by TEXT,
  tl_processed_at TIMESTAMPTZ,
  root_cause_analysis TEXT,
  corrective_action TEXT,
  preventive_action TEXT,

  -- Process Lead Fields
  process_approved_by TEXT,
  process_approved_at TIMESTAMPTZ,
  process_rejection_reason TEXT,
  process_comment TEXT,

  -- QA Manager Fields
  manager_approved_by TEXT,
  manager_approved_at TIMESTAMPTZ,
  manager_rejection_reason TEXT,
  manager_comment TEXT,

  -- Final status
  archived_at TIMESTAMPTZ
);
```

3. **ncp_audit_log** - Tracks all changes to NCP reports
```sql
CREATE TABLE ncp_audit_log (
  id SERIAL PRIMARY KEY,
  ncp_id TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  description TEXT
);
```

4. **system_logs** - System event logging
```sql
CREATE TABLE system_logs (
  id SERIAL PRIMARY KEY,
  level TEXT NOT NULL, -- e.g., 'info', 'warn', 'error'
  message TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

5. **api_keys** - API key management
```sql
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  service_name TEXT NOT NULL,
  permissions TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);
```

6. **notifications** - User notifications
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  ncp_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

7. **Additional Configuration Tables**
- `sku_codes` - Product codes
- `machines` - Manufacturing machines
- `uoms` - Units of measure
- `system_settings` - System configuration

## User Roles and Permissions

### Available Roles
1. **QA User** - Submit NCP reports
2. **QA Leader** - Initial review and approval
3. **Team Leader** - Root Cause Analysis (RCA) and corrective actions
4. **Process Lead** - Review of RCA and actions
5. **QA Manager** - Final approval
6. **Admin** - System administration
7. **Super Admin** - Full system access and configuration
8. **Public** - Read-only access to all NCP reports without authentication

### Role-Based Access Control

| Feature | User | QA Leader | Team Leader | Process Lead | QA Manager | Admin | Super Admin | Public |
|---------|------|-----------|-------------|--------------|------------|-------|-------------|--------|
| Submit NCP | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  |
| View Own NCPs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |  |
| View All NCPs |  |  |  |  |  | ✓ | ✓ | ✓ |
| QA Approval |  | ✓ |  |  |  | ✓ | ✓ |  |
| RCA Processing |  |  | ✓ |  |  | ✓ | ✓ |  |
| Process Review |  |  |  | ✓ |  | ✓ | ✓ |  |
| Final Approval |  |  |  |  | ✓ | ✓ | ✓ |  |
| User Management |  |  |  |  |  | ✓ | ✓ |  |
| System Settings |  |  |  |  |  | ✓ | ✓ |  |
| Audit Logs |  |  |  |  |  | ✓ | ✓ |  |
| Delete NCPs |  |  |  |  |  |  | ✓ |  |
| Workflow Intervention |  |  |  |  |  |  | ✓ |  |

## Workflow

### Complete NCP Lifecycle
1. **Submission**: QA User submits NCP report
2. **QA Review**: QA Leader approves/rejects and assigns for RCA
3. **RCA Analysis**: Team Leader performs root cause analysis
4. **Process Review**: Process Lead reviews RCA and actions
5. **Final Approval**: QA Manager provides final approval
6. **Archiving**: Completed reports are archived

### Status Transitions
- `pending` → `qa_approved` → `tl_processed` → `process_approved` → `manager_approved`
- Any step can be rejected and returned to previous stage

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### User Management Endpoints
- `GET /api/users` - Get all users (Admin/Super Admin)
- `POST /api/users` - Create new user (Super Admin)
- `PUT /api/users/[id]/role` - Update user role (Super Admin)
- `PUT /api/users/[id]/status` - Update user status (Super Admin)
- `PUT /api/users/[id]/password` - Reset user password (Super Admin)
- `DELETE /api/users/[id]` - Delete user (Super Admin)
- `GET /api/users/by-role` - Get users by role (Admin/Super Admin)

### NCP Report Endpoints
- `POST /api/ncp/submit` - Submit new NCP report
- `GET /api/ncp/list` - Get NCP reports
- `GET /api/ncp/details/[id]` - Get NCP report details
- `PUT /api/ncp/details/[id]` - Update NCP report (Super Admin)
- `DELETE /api/ncp/details/[id]` - Delete NCP report (Super Admin)
- `PUT /api/ncp/approve-qa` - QA Leader approval
- `PUT /api/ncp/process-tl` - Team Leader processing
- `PUT /api/ncp/approve-process` - Process Lead approval
- `PUT /api/ncp/approve-manager` - QA Manager approval
- `PUT /api/ncp/[id]/revert-status` - Revert status (Super Admin)
- `PUT /api/ncp/[id]/reassign` - Reassign report (Super Admin)

### System Endpoints
- `GET /api/audit-log` - Get audit logs (Super Admin)
- `GET /api/system-logs` - Get system logs (Super Admin)
- `GET /api/api-keys` - Get API keys (Super Admin)
- `POST /api/api-keys` - Create API key (Super Admin)
- `DELETE /api/api-keys/[id]` - Delete API key (Super Admin)
- `GET /api/analytics` - Get analytics data (Super Admin)

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/ncps` - Get dashboard NCPs
- `GET /api/public/ncps` - Get all NCPs for public access (no authentication required)

## Components

### Dashboard Components
- `AppSidebar` - Navigation sidebar with role-based menu
- `DashboardHeader` - Top navigation bar with user controls
- `RoleSpecificDashboard` - Dynamic dashboard based on user role
- `NCPInputForm` - Form for submitting new NCP reports
- `QALeaderApproval` - QA Leader approval interface
- `TeamLeaderProcessing` - Team Leader RCA processing interface
- `ProcessLeadApproval` - Process Lead approval interface
- `QAManagerApproval` - QA Manager final approval interface
- `DatabaseNCP` - NCP database browser
- `NCPFlowTracker` - Visual workflow tracker
- `SystemSettings` - System configuration interface

### UI Components
- `DataTable` - Interactive data table with sorting and filtering
- `Card` - Content containers with headers and footers
- `Button` - Interactive buttons with various styles
- `Input` - Form input fields
- `Select` - Dropdown selection components
- `Dialog` - Modal dialogs for forms and confirmations
- `Badge` - Status indicators and tags
- `Tabs` - Tabbed navigation interface

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow functional component patterns with React hooks
- Maintain consistent naming conventions
- Write descriptive comments for complex logic

### Component Structure
```tsx
"use client"

import React from "react"
import { Button } from "@/components/ui/button"

interface ComponentProps {
  // Define props interface
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic here
  
  return (
    <div className="p-6">
      {/* Component JSX */}
    </div>
  )
}
```

### API Route Structure
```ts
import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const auth = await verifyAuth(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Authorization check
    if (auth.role !== "required_role") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    // Business logic
    const data = getData()
    
    // Return success response
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
```

## Deployment

### Production Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Variables
Production environment requires:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your-production-secret
NODE_ENV=production
```

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set the environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (as a secret)
   - `JWT_SECRET`
3. Deploy the application

### Docker Deployment
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t qa-portal .
docker run -p 3000:3000 qa-portal
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify Supabase credentials in environment variables
   - Check JWT secret configuration
   - Ensure user accounts exist in Supabase database

2. **Database Connection Errors**
   - Verify Supabase project URL is correct
   - Check network connectivity to Supabase
   - Ensure Supabase service is running

3. **API Route Errors**
   - Check request format and required fields
   - Verify authentication tokens are valid
   - Ensure user has appropriate permissions

4. **UI Rendering Issues**
   - Check browser console for JavaScript errors
   - Verify all dependencies are installed
   - Ensure CSS files are loaded correctly

### Debugging Tools

1. **Browser Developer Tools**
   - Network tab to monitor API requests
   - Console tab for JavaScript errors
   - Elements tab to inspect DOM structure

2. **Supabase Dashboard**
   - SQL Editor for database queries
   - Authentication logs for user activity
   - API logs for request tracking

3. **Server Logs**
   - Next.js development server logs
   - Supabase function logs
   - System event logs

---

*This documentation reflects the current state of the Quality Assurance Portal after migration to Supabase. All SQLite references have been removed and replaced with Supabase PostgreSQL implementation.*