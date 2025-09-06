# Quality Assurance Portal v0.1.0

A comprehensive web application for managing Non-Conformance Product (NCP) reports through a structured workflow process.

Last Updated: September 6, 2025

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Functionality
- **Multi-role User Management**: 8 distinct roles with role-based access control
- **Complete NCP Workflow**: End-to-end process from submission to final approval
- **Real-time Notifications**: Keep users informed of status changes
- **Comprehensive Reporting**: Detailed analytics and reporting capabilities
- **Audit Trail**: Complete history of all system changes
- **System Administration**: Full system configuration and management
- **Public Access**: Read-only view of all NCP reports without authentication

### User Roles
1. **QA User**: Submit NCP reports
2. **QA Leader**: Initial review and approval
3. **Team Leader**: Root Cause Analysis (RCA) and corrective actions
4. **Process Lead**: Review of RCA and actions
5. **QA Manager**: Final approval
6. **Admin**: System administration
7. **Super Admin**: Full system access and configuration
8. **Public**: Read-only access to all NCP reports without authentication

### Workflow Process
1. **Submission**: QA User submits NCP report
2. **QA Review**: QA Leader approves/rejects and assigns for RCA
3. **RCA Analysis**: Team Leader performs root cause analysis
4. **Process Review**: Process Lead reviews RCA and actions
5. **Final Approval**: QA Manager provides final approval
6. **Archiving**: Completed reports are archived

### Super Admin Capabilities
- **User Management**: Create, edit, delete users; assign roles and permissions; activate/deactivate user accounts; reset user passwords
- **Workflow Intervention**: View all NCP reports regardless of workflow stage; edit any field in any NCP report at any stage; revert NCP status to previous stages; reassign reports between users; bypass normal approval workflow when needed
- **Full NCP Report Management**: Create new NCP reports manually; view all NCP reports in the system; update any field in any NCP report; delete NCP reports permanently
- **System Settings Management**: Manage SKU codes and descriptions; manage manufacturing machines; manage units of measure (UOM); configure NCP numbering format; set auto-reset settings
- **System Monitoring**: Comprehensive audit logs; system event logging; API key management; analytics dashboard with visualizations
- **Database Management**: Backup and restore functionality; data integrity monitoring

### Public Access Feature
- **No Authentication Required**: Access NCP data without login
- **Read-Only Dashboard**: View all NCP reports with filtering capabilities
- **Data Visualization**: Charts showing NCP statistics by machine and status
- **Detailed Reports**: View complete NCP report details
- **Filtering Options**: Filter by machine code, SKU code, and date range

For detailed information about the public access feature, see [Public Access Feature Documentation](PUBLIC_ACCESS_FEATURE.md).

## Technology Stack

### Frontend
- [Next.js 14](https://nextjs.org/) with App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) component library
- [Recharts](https://recharts.org/) for data visualization
- [Lucide React](https://lucide.dev/) icons

### Backend
- Next.js API Routes
- [Better SQLite3](https://github.com/WiseLibs/better-sqlite3) database
- [Bcrypt.js](https://www.npmjs.com/package/bcryptjs) for password hashing
- [Jose](https://github.com/panva/jose) for JWT handling

### Development Tools
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io/) for code formatting
- [Git](https://git-scm.com/) for version control

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Git for version control

## Installation

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

4. Update `.env.local` with your configuration:
```env
JWT_SECRET=your-super-secret-jwt-key
```

5. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Default User Accounts
After the first run, the system will create default users:
- **super_admin** / password: (check console output)
- **admin** / password: (check console output)
- **qa_leader** / password: (check console output)
- **team_leader** / password: (check console output)
- **process_lead** / password: (check console output)
- **qa_manager** / password: (check console output)
- **user** / password: (check console output)

### First Time Login
1. Navigate to the login page
2. Use one of the default accounts
3. Change your password after first login
4. Explore the features based on your role

## Documentation

Comprehensive documentation is available in the `docs/` directory:

### For End Users
- [User Guide](docs/USER_GUIDE.md): Comprehensive guide for using the system
- [Business Workflow](docs/BUSINESS_WORKFLOW.md): Detailed process documentation

### For Developers
- [Developer Guide](docs/DEVELOPER_GUIDE.md): Technical implementation details
- [API Documentation](docs/API_DOCUMENTATION.md): Complete API reference
- [Setup and Configuration](docs/SETUP_CONFIGURATION.md): Installation and deployment guide
- [Testing and QA](docs/TESTING_QA.md): Quality assurance framework

### Comprehensive Documentation
- [Complete Documentation](docs/COMPLETE_DOCUMENTATION.md): Full technical reference
- [Super Admin Features](SUPER_ADMIN_FEATURES.md): Detailed Super Admin capabilities

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

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users` - Get all users (Admin/Super Admin)
- `POST /api/users` - Create new user (Super Admin)
- `PUT /api/users/[id]/role` - Update user role (Super Admin)
- `PUT /api/users/[id]/status` - Update user status (Super Admin)
- `PUT /api/users/[id]/password` - Reset user password (Super Admin)
- `DELETE /api/users/[id]` - Delete user (Super Admin)
- `GET /api/users/by-role` - Get users by role (Admin/Super Admin)

### NCP Reports
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

### System Settings
- `GET /api/system-settings/sku-codes` - Get SKU codes
- `POST /api/system-settings/sku-codes` - Create SKU code (Super Admin)
- `PUT /api/system-settings/sku-codes` - Update SKU code (Super Admin)
- `DELETE /api/system-settings/sku-codes` - Delete SKU code (Super Admin)
- `GET /api/system-settings/machines` - Get machines
- `POST /api/system-settings/machines` - Create machine (Super Admin)
- `PUT /api/system-settings/machines` - Update machine (Super Admin)
- `DELETE /api/system-settings/machines` - Delete machine (Super Admin)
- `GET /api/system-settings/uoms` - Get UOMs
- `POST /api/system-settings/uoms` - Create UOM (Super Admin)
- `PUT /api/system-settings/uoms` - Update UOM (Super Admin)
- `DELETE /api/system-settings/uoms` - Delete UOM (Super Admin)
- `GET /api/system-settings/config` - Get system setting
- `POST /api/system-settings/config` - Set system setting (Super Admin)

### Monitoring
- `GET /api/audit-log` - Get audit logs (Super Admin)
- `GET /api/system-logs` - Get system logs (Super Admin)
- `GET /api/api-keys` - Get API keys (Super Admin)
- `POST /api/api-keys` - Create API key (Super Admin)
- `DELETE /api/api-keys/[id]` - Delete API key (Super Admin)
- `GET /api/analytics` - Get analytics data (Super Admin)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/ncps` - Get dashboard NCPs
- `GET /api/public/ncps` - Get all NCPs for public access (no authentication required)

## Database Schema

The application uses SQLite with the following key tables:

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  full_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### NCP Reports Table
Contains all fields needed for the complete workflow:
- Basic information (ID, SKU, machine, dates)
- Approval workflow fields for each role
- Status tracking
- Timestamps for audit trail

### Additional Tables
- `ncp_audit_log` - Tracks all changes to NCP reports
- `system_logs` - System event logging
- `api_keys` - API key management
- `system_settings` - System configuration
- `sku_codes` - Product codes
- `machines` - Manufacturing machines
- `uoms` - Units of measure

## User Roles and Permissions

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

## Development

### Development Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test:all` - Run all tests with custom test runner
- `npm run test:simple` - Run basic file existence tests

### Development Guidelines
1. Use TypeScript for type safety
2. Follow functional component patterns with React hooks
3. Maintain consistent naming conventions
4. Write descriptive comments for complex logic
5. Use ESLint and Prettier for code formatting

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
JWT_SECRET=your-production-secret
NODE_ENV=production
```

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Update documentation
6. Submit a pull request

### Code Style
- Follow TypeScript best practices
- Use functional components with React hooks
- Maintain consistent naming conventions
- Write descriptive comments for complex logic

### Commit Messages
Use conventional commit messages:
- `feat: Add new feature`
- `fix: Fix bug in component`
- `docs: Update documentation`
- `refactor: Improve code structure`
- `test: Add new tests`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

For detailed information about using the system, please refer to the [User Guide](docs/USER_GUIDE.md). For development information, see the [Developer Guide](docs/DEVELOPER_GUIDE.md).