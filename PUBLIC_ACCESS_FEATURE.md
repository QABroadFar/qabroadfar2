# Public Access Feature

Last Updated: September 6, 2025

This document describes the new public access feature that allows users to view NCP data without authentication.

## Overview

The public access feature provides a read-only view of all NCP (Non-Conformance Product) reports in the system. Users can access this view without needing to log in or provide any credentials.

## Implementation Details

### 1. Public Dashboard

A new public dashboard has been created at `/public/dashboard` that provides:

- A view of all NCP reports in the system
- Filtering capabilities by:
  - Machine Code
  - SKU Code
  - Incident Date Range
- Data visualization through charts:
  - Bar chart showing NCP reports by machine
  - Pie chart showing NCP reports by status
- Detailed view of each NCP report

### 2. Public API Endpoint

A new API endpoint has been created at `/api/public/ncps` that returns all NCP reports without requiring authentication.

### 3. Login Page Integration

The login page now includes a "View Public Dashboard" button that allows users to access the public dashboard without authentication.

### 4. Middleware Changes

The middleware has been updated to allow public access to:
- `/public` paths
- `/api/public` endpoints

## Security Considerations

Since this feature provides public access to data, it's important to note:

1. Only read operations are allowed - no data modification is possible through the public interface
2. No sensitive user information is exposed
3. All NCP data is considered public information in this implementation

## Code Structure

```
/app/public/dashboard/page.tsx          # Public dashboard page
/app/api/public/ncps/route.ts           # Public API endpoint
/login-page.tsx                         # Updated login page with public access button
/middleware.ts                          # Updated middleware to allow public access
/app/dashboard/components/database-ncp.tsx  # Updated NCP component to handle public role
```

## Testing

A test has been added to verify the public access feature:
- `__tests__/public-dashboard.test.ts` - Tests public dashboard access

To run the test:
```bash
npm run test
```

## Usage

1. Navigate to the login page
2. Click on "View Public Dashboard"
3. Browse and filter NCP reports as needed
4. View detailed information for each NCP report