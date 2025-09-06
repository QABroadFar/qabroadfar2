# Setup and Configuration Guide

Last Updated: September 6, 2025

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Initial Setup](#initial-setup)
5. [Environment Variables](#environment-variables)
6. [Database Configuration](#database-configuration)
7. [User Management](#user-management)
8. [System Settings](#system-settings)
9. [Security Configuration](#security-configuration)
10. [Backup and Recovery](#backup-and-recovery)
11. [Monitoring and Logging](#monitoring-and-logging)
12. [Performance Tuning](#performance-tuning)
13. [Troubleshooting](#troubleshooting)

## System Requirements

### Hardware Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 10GB disk space
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB disk space

### Software Requirements
- **Operating System**: Linux, macOS, or Windows
- **Node.js**: Version 18 or higher
- **npm/pnpm**: Package manager
- **Git**: Version control system
- **SQLite**: Version 3.37 or higher (automatically installed)

### Browser Requirements
- Google Chrome (latest version)
- Mozilla Firefox (latest version)
- Microsoft Edge (latest version)
- Safari (latest version)

## Installation

### Step 1: Install Node.js
Download and install Node.js from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version
npm --version
```

### Step 2: Clone the Repository
```bash
git clone <repository-url>
cd qabroadfar2
```

### Step 3: Install Dependencies
```bash
npm install
# or
pnpm install
```

### Step 4: Create Environment Configuration
```bash
cp .env.example .env.local
```

## Configuration

### Environment Variables
Edit `.env.local` to configure your environment:

```env
# Required - Change this to a secure secret in production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional - Database file path (defaults to qa_portal.db)
DATABASE_PATH=./qa_portal.db

# Optional - Port (defaults to 3000)
PORT=3000
```

### Production Environment
For production deployments, create `.env.production`:

```env
JWT_SECRET=your-very-secure-production-jwt-secret
DATABASE_PATH=/var/lib/qa-portal/qa_portal.db
PORT=3000
NODE_ENV=production
```

## Initial Setup

### First Run
When you first run the application, it will:

1. Create the SQLite database file
2. Initialize all required database tables
3. Create default user accounts
4. Set up initial system configuration

### Starting the Application
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### Default User Accounts
The system automatically creates these default accounts on first run:

| Username | Role | Default Password | Notes |
|----------|------|------------------|-------|
| super_admin | Super Admin | Check console output | Full system access |
| admin | Admin | Check console output | System administration |
| qa_leader | QA Leader | Check console output | NCP approval |
| team_leader | Team Leader | Check console output | RCA processing |
| process_lead | Process Lead | Check console output | Process review |
| qa_manager | QA Manager | Check console output | Final approval |
| user | User | Check console output | NCP submission |

**Important**: Change all default passwords immediately after first login!

## Environment Variables

### Required Variables
- `JWT_SECRET`: Secret key for JWT token signing (required)

### Optional Variables
- `DATABASE_PATH`: Path to SQLite database file (default: `./qa_portal.db`)
- `PORT`: Port to run the application on (default: `3000`)
- `NODE_ENV`: Environment mode (`development` or `production`)

### Security Considerations
- Never commit `.env` files to version control
- Use different secrets for development and production
- Rotate secrets regularly in production

## Database Configuration

### Database File
The application uses SQLite for simplicity and ease of deployment. The database file is created automatically on first run.

### Database Location
- **Development**: `./qa_portal.db` (relative to project root)
- **Production**: Configurable via `DATABASE_PATH` environment variable

### Database Schema
The system automatically creates these tables on first run:
- `users`: User accounts and roles
- `ncp_reports`: NCP report data and workflow fields
- `ncp_audit_log`: Audit trail of changes
- `system_logs`: System event logging
- `api_keys`: API key management
- `system_settings`: System configuration
- `sku_codes`: Product codes
- `machines`: Manufacturing machines
- `uoms`: Units of measure

### Database Maintenance
- Regular backups are recommended
- SQLite handles concurrency well for moderate loads
- Consider migration to PostgreSQL for high-traffic environments

## User Management

### Default Users
See the [Default User Accounts](#default-user-accounts) section above.

### Adding New Users
1. Log in as Super Admin or Admin
2. Navigate to User Management
3. Click "Add User"
4. Fill in user details:
   - Username (must be unique)
   - Full Name
   - Password
   - Role
5. Click "Create User"

### User Roles
See the [User Roles](../README.md#user-roles) section in the main README.

### Password Policy
- Minimum 8 characters
- Mix of letters, numbers, and special characters recommended
- Passwords are securely hashed using bcrypt

### User Status
- **Active**: User can log in and use the system
- **Inactive**: User account is disabled

## System Settings

### SKU Codes Management
1. Navigate to System Settings
2. Go to SKU Codes section
3. Add new codes:
   - Code (unique identifier)
   - Description (product name/details)
4. Edit or delete existing codes as needed

### Machines Management
1. Navigate to System Settings
2. Go to Machines section
3. Add new machines:
   - Code (unique identifier)
   - Name (machine description)
4. Edit or delete existing machines as needed

### Units of Measure (UOM) Management
1. Navigate to System Settings
2. Go to UOMs section
3. Add new units:
   - Code (unique identifier)
   - Name (unit description)
4. Edit or delete existing units as needed

### NCP Numbering Format
Configure the format for auto-generated NCP report IDs:
- Default: `YYMM-XXXX` (e.g., 2301-0001)
- Options for customization in System Settings

## Security Configuration

### JWT Configuration
- Tokens expire after 24 hours
- Tokens are stored in HTTP-only cookies
- Tokens are signed with HS256 algorithm

### Password Security
- Passwords are hashed with bcrypt (10 rounds)
- Minimum 8 characters required
- No complexity requirements enforced (customizable)

### Role-Based Access Control
- Each endpoint validates user role
- Super Admin has access to all endpoints
- Admin has access to most administrative functions
- Other roles have limited, role-specific access

### API Security
- Rate limiting (planned for future implementation)
- Input validation on all endpoints
- SQL injection prevention through parameterized queries

## Backup and Recovery

### Database Backup
1. Super Admin can access Backup/Restore feature
2. Click "Create Database Backup"
3. Backup file is generated with timestamp
4. Store backup files in secure location

### Automated Backups (Planned)
Future versions will support:
- Daily/weekly backup scheduling
- Automatic backup retention policies
- Backup verification

### Database Recovery
1. Super Admin can access Backup/Restore feature
2. Upload backup file
3. Confirm restore operation (destructive)
4. System restarts with restored data

### Backup Best Practices
- Regular automated backups
- Store backups in multiple locations
- Test restore procedures periodically
- Encrypt backup files for sensitive environments

## Monitoring and Logging

### Audit Trail
All NCP report changes are logged:
- Who made the change
- When it was made
- What field was changed
- Old and new values
- Description of the change

### System Logs
System events are logged:
- User login/logout
- Security events
- Error conditions
- System maintenance

### Log Levels
- **Info**: Normal operational messages
- **Warn**: Warning conditions
- **Error**: Error conditions

### Log Retention
- Logs are retained indefinitely
- Consider implementing log rotation for production

## Performance Tuning

### Database Optimization
- SQLite performs well for moderate loads
- Consider indexes on frequently queried columns
- Monitor query performance with EXPLAIN

### Frontend Optimization
- Code splitting with dynamic imports
- Image optimization with Next.js Image component
- Bundle analysis to identify large dependencies

### Caching Strategies
- Browser caching for static assets
- API response caching (planned)
- Database query caching (planned)

### Scaling Considerations
For high-traffic environments:
- Consider migration to PostgreSQL
- Implement load balancing
- Use CDN for static assets
- Implement database connection pooling

## Troubleshooting

### Common Issues

#### Database Connection Problems
- Ensure database file has proper permissions
- Check if database file exists in correct location
- Verify database schema is initialized

#### Authentication Issues
- Check JWT_SECRET environment variable
- Verify token expiration settings
- Ensure cookies are enabled in browser

#### Performance Problems
- Check server resource utilization
- Monitor database query performance
- Implement caching where appropriate

#### API Errors
- Check request method matches route handler
- Verify request body format
- Ensure proper authentication headers

### Log Analysis
Check these locations for troubleshooting information:
- Application console output
- Database logs (if configured)
- Browser developer tools console
- Browser network tab for API requests

### Support
For issues not resolved by this guide:
1. Check existing GitHub issues
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce
4. Provide environment and version information

---

This setup and configuration guide provides comprehensive information for deploying and maintaining the Quality Assurance Portal. For additional help, refer to the other documentation files in the `docs/` directory.