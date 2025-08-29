# Quality Assurance Portal Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Development Environment](#development-environment)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Component Library](#component-library)
9. [State Management](#state-management)
10. [Authentication](#authentication)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Performance Optimization](#performance-optimization)
14. [Security Considerations](#security-considerations)
15. [Contributing](#contributing)

## Project Overview

The Quality Assurance Portal is a Next.js 14 application built with the App Router, designed to manage Non-Conformance Product (NCP) reports through a structured workflow. The system implements role-based access control and provides a comprehensive audit trail for all activities.

### Key Features
- Multi-role user management
- Complete NCP workflow from submission to final approval
- Real-time notifications
- Comprehensive reporting and analytics
- Audit trail for all system activities
- Super Admin capabilities for system management

## Technology Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization
- **Lucide React** for icons
- **React Hook Form** for form handling
- **Zod** for validation

### Backend
- **Next.js API Routes** for serverless functions
- **Better SQLite3** for database operations
- **Bcrypt.js** for password hashing
- **Jose** for JWT token handling
- **Date-fns** for date manipulation

### Development Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **Git** for version control
- **Jest** for testing (planned)

## Architecture

The system follows a modern web application architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js API  │◄──►│   (SQLite)      │
│                 │    │    Routes)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Library    │    │   Business      │    │   Data Models   │
│   (shadcn/ui)   │    │   Logic         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **UI Layer**: React components handle user interactions
2. **State Management**: React state and effects manage component state
3. **API Layer**: Next.js API routes handle business logic
4. **Database Layer**: SQLite database stores all persistent data
5. **Authentication**: JWT tokens secure API access

## Project Structure

```
qabroadfar2/
├── app/                    # App Router pages and components
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── dashboard/     # Dashboard endpoints
│   │   ├── ncp/           # NCP management endpoints
│   │   ├── users/         # User management endpoints
│   │   ├── system-settings/ # System settings endpoints
│   │   └── ...            # Other API endpoints
│   ├── dashboard/         # Dashboard pages and components
│   └── login/             # Login page
├── components/            # Shared UI components
│   ├── ui/                # shadcn/ui components
│   └── ...                # Custom components
├── lib/                   # Utility functions and business logic
├── public/                # Static assets
├── styles/                # Global styles
├── docs/                  # Documentation
├── tests/                 # Test files (planned)
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

## Development Environment

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager
- Git for version control
- Code editor (VS Code recommended)

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

### Development Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Database Design

### Database Choice
SQLite was chosen for its simplicity, zero-configuration setup, and suitability for this application's scale.

### Schema Overview

#### Users Table
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

#### NCP Reports Table
The NCP reports table contains all fields needed for the complete workflow:
- Basic information (ID, SKU, machine, dates)
- Approval workflow fields for each role
- Status tracking
- Timestamps for audit trail

#### Audit Log Table
Tracks all changes to NCP reports for accountability:
- NCP ID
- User who made the change
- Field changed
- Old and new values
- Description of change

#### System Tables
Additional tables for system functionality:
- System settings
- SKU codes
- Machines
- Units of measure
- API keys
- System logs

### Database Access Layer
The `lib/database.ts` file provides a clean abstraction over database operations:

```typescript
// Example database function
export function createUser(username: string, password: string, role: string, fullName: string) {
  const hashedPassword = hashSync(password, 10)
  const stmt = db.prepare(`
    INSERT INTO users (username, password, role, full_name, is_active)
    VALUES (?, ?, ?, ?, ?)
  `)
  return stmt.run(username, hashedPassword, role, fullName || null, true)
}
```

## API Design

### RESTful Principles
API routes follow RESTful principles:
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Use descriptive endpoint names
- Return consistent response formats
- Use proper HTTP status codes

### Authentication
All API endpoints (except authentication) require JWT token authentication:

```typescript
// Example API route with authentication
import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Business logic here
}
```

### Response Format
API responses follow a consistent format:

```json
{
  "success": true,
  "data": { /* ... */ }
}
```

Or for errors:
```json
{
  "error": "Error message"
}
```

### Rate Limiting (Planned)
Future implementations will include rate limiting to prevent abuse.

## Component Library

### shadcn/ui Components
The project uses shadcn/ui components for consistent UI:

- **Button**: Primary and secondary actions
- **Card**: Content containers
- **Input**: Text input fields
- **Table**: Data display
- **Dialog**: Modal windows
- **Badge**: Status indicators
- And many more

### Custom Components
Custom components are organized by feature:

#### Dashboard Components
- `AppSidebar`: Navigation sidebar
- `DashboardHeader`: User information header
- `RoleSpecificDashboard`: Role-based dashboard content
- `DatabaseNCP`: NCP report management
- `UserManagement`: User administration

#### Super Admin Components
- `SystemSettings`: System configuration
- `AuditLog`: Audit trail viewer
- `SystemLogs`: System event logs
- `ApiKeysManagement`: API key management
- `BackupRestore`: Database backup/restore
- `AnalyticsDashboard`: System analytics

### Component Structure
Components follow a consistent structure:

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

## State Management

### React State
Most component state is managed using React's built-in state management:

```tsx
const [state, setState] = useState(initialValue)
```

### Complex State
For more complex state management, consider:
- `useReducer` for complex state transitions
- Context API for global state (if needed)
- Third-party libraries like Zustand (if complexity warrants)

### Data Fetching
Data is fetched using `useEffect` and `fetch`:

```tsx
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch("/api/endpoint")
      if (response.ok) {
        const data = await response.json()
        setData(data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }
  
  fetchData()
}, [])
```

## Authentication

### JWT Implementation
Authentication uses JWT tokens stored in HTTP-only cookies:

```typescript
// lib/auth.ts
import { jwtVerify } from "jose"

export async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, secret)
    return {
      id: payload.userId as number,
      username: payload.username as string,
      role: payload.role as string,
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return null
  }
}
```

### Role-Based Access Control
RBAC is implemented at both component and API levels:

```tsx
// Component level
{userInfo.role === "admin" && (
  <AdminComponent />
)}

// API level
if (auth.role !== "required_role") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
```

## Testing

### Current State
Testing is planned but not yet implemented.

### Planned Testing Strategy

#### Unit Tests
- Test utility functions in `lib/`
- Test database functions
- Test authentication functions

#### Integration Tests
- Test API routes
- Test database operations
- Test authentication flow

#### End-to-End Tests
- Test user workflows
- Test role-specific features
- Test edge cases

### Testing Tools
- **Jest** for unit and integration tests
- **React Testing Library** for component tests
- **Cypress** for end-to-end tests

### Test Structure
```
tests/
├── unit/
│   ├── lib/
│   └── components/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    ├── workflows/
    └── features/
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

### CI/CD Pipeline
Example GitHub Actions workflow:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npm test
```

## Performance Optimization

### Database Optimization
- Use indexes on frequently queried columns
- Optimize complex queries
- Consider pagination for large datasets

### Frontend Optimization
- Code splitting with dynamic imports
- Image optimization with Next.js Image component
- Bundle analysis to identify large dependencies

### Caching Strategies
- API response caching (where appropriate)
- Database query caching
- Browser caching for static assets

### Lazy Loading
- Load components only when needed
- Implement virtual scrolling for large lists
- Defer non-critical JavaScript

## Security Considerations

### Authentication Security
- Use strong JWT secrets
- Implement token expiration
- Use HTTP-only cookies
- Secure password storage with bcrypt

### Input Validation
- Validate all user inputs
- Sanitize data before database storage
- Use Zod for schema validation

### API Security
- Implement rate limiting
- Use proper CORS headers
- Validate user permissions for each request

### Database Security
- Use parameterized queries to prevent SQL injection
- Regular database backups
- Secure database file permissions

### Data Privacy
- Encrypt sensitive data in transit
- Minimize data retention where possible
- Implement data deletion procedures

## Contributing

### Code Style
- Follow TypeScript best practices
- Use functional components with React hooks
- Maintain consistent naming conventions
- Write descriptive comments for complex logic

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Update documentation
6. Submit a pull request

### Code Review Guidelines
- Review for security issues
- Check for performance problems
- Ensure code follows style guidelines
- Verify tests pass
- Confirm documentation is updated

### Commit Messages
Use conventional commit messages:
- `feat: Add new feature`
- `fix: Fix bug in component`
- `docs: Update documentation`
- `refactor: Improve code structure`
- `test: Add new tests`

### Branch Naming
Use descriptive branch names:
- `feature/user-management`
- `bugfix/login-error`
- `docs/api-documentation`
- `refactor/database-layer`

---

This developer guide provides comprehensive information for contributing to and maintaining the Quality Assurance Portal. For any questions or issues, please refer to the development team or create an issue in the project repository.