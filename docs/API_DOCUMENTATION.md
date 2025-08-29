# API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [NCP Reports](#ncp-reports)
4. [System Settings](#system-settings)
5. [Monitoring](#monitoring)
6. [Dashboard](#dashboard)
7. [Error Handling](#error-handling)

## Authentication

All API endpoints (except login) require authentication via JWT token in cookies.

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "token": "jwt-token"
}
```

### Logout
```
POST /api/auth/logout

Response:
{
  "success": true
}
```

### Get Current User
```
GET /api/auth/me

Response:
{
  "success": true,
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "qa_leader",
    "fullName": "John Doe"
  }
}
```

## Users

### Get All Users (Super Admin/Admin only)
```
GET /api/users

Response:
[
  {
    "id": 1,
    "username": "john_doe",
    "role": "qa_leader",
    "full_name": "John Doe",
    "is_active": true,
    "created_at": "2023-01-01T00:00:00.000Z"
  }
]
```

### Create User (Super Admin only)
```
POST /api/users
Content-Type: application/json

{
  "username": "new_user",
  "password": "secure_password",
  "role": "user",
  "fullName": "New User"
}

Response:
{
  "message": "User created successfully"
}
```

### Update User Role (Super Admin only)
```
PUT /api/users/{id}/role
Content-Type: application/json

{
  "role": "qa_leader"
}

Response:
{
  "message": "User role updated successfully"
}
```

### Update User Status (Super Admin only)
```
PUT /api/users/{id}/status
Content-Type: application/json

{
  "is_active": false
}

Response:
{
  "message": "User status updated successfully"
}
```

### Reset User Password (Super Admin only)
```
PUT /api/users/{id}/password
Content-Type: application/json

{
  "password": "new_password"
}

Response:
{
  "message": "User password updated successfully"
}
```

### Delete User (Super Admin only)
```
DELETE /api/users/{id}

Response:
{
  "message": "User deleted successfully"
}
```

### Get Users by Role (Admin/Super Admin only)
```
GET /api/users/by-role?role=qa_leader

Response:
[
  {
    "id": 1,
    "username": "john_doe",
    "full_name": "John Doe"
  }
]
```

## NCP Reports

### Submit NCP Report
```
POST /api/ncp/submit
Content-Type: application/json

{
  "skuCode": "SKU001",
  "machineCode": "MCH001",
  "date": "2023-01-01",
  "timeIncident": "10:30",
  "holdQuantity": 100,
  "holdQuantityUOM": "PCS",
  "problemDescription": "Product defect found",
  "photoAttachment": "base64-encoded-image",
  "qaLeader": "qa_leader_username"
}

Response:
{
  "success": true,
  "ncpId": "2301-0001"
}
```

### Get NCP Reports
```
GET /api/ncp/list?type=all|pending|approved

Response:
[
  {
    "id": 1,
    "ncp_id": "2301-0001",
    "sku_code": "SKU001",
    "machine_code": "MCH001",
    "date": "2023-01-01",
    "status": "pending",
    "submitted_by": "john_doe",
    "submitted_at": "2023-01-01T10:30:00.000Z"
  }
]
```

### Get NCP Details
```
GET /api/ncp/details/{id}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "ncp_id": "2301-0001",
    "sku_code": "SKU001",
    "machine_code": "MCH001",
    "date": "2023-01-01",
    "time_incident": "10:30",
    "hold_quantity": 100,
    "hold_quantity_uom": "PCS",
    "problem_description": "Product defect found",
    "photo_attachment": "base64-encoded-image",
    "qa_leader": "qa_leader_username",
    "status": "pending",
    "submitted_by": "john_doe",
    "submitted_at": "2023-01-01T10:30:00.000Z"
    // ... all other fields
  }
}
```

### Update NCP Report (Super Admin only)
```
PUT /api/ncp/details/{id}
Content-Type: application/json

{
  "sku_code": "SKU002",
  "problem_description": "Updated problem description"
}

Response:
{
  "message": "NCP report updated successfully"
}
```

### Delete NCP Report (Super Admin only)
```
DELETE /api/ncp/details/{id}

Response:
{
  "message": "NCP report deleted successfully"
}
```

### QA Leader Approval
```
PUT /api/ncp/approve-qa
Content-Type: application/json

{
  "id": 1,
  "disposisi": "Sortir",
  "jumlahSortir": "50",
  "jumlahRelease": "30",
  "jumlahReject": "20",
  "assignedTeamLeader": "team_leader_username"
}

Response:
{
  "success": true
}
```

### Team Leader Processing
```
PUT /api/ncp/process-tl
Content-Type: application/json

{
  "id": 1,
  "rootCauseAnalysis": "Root cause identified",
  "correctiveAction": "Corrective action taken",
  "preventiveAction": "Preventive action planned"
}

Response:
{
  "success": true
}
```

### Process Lead Approval
```
PUT /api/ncp/approve-process
Content-Type: application/json

{
  "id": 1,
  "comment": "Approved with comments"
}

Response:
{
  "success": true
}
```

### QA Manager Approval
```
PUT /api/ncp/approve-manager
Content-Type: application/json

{
  "id": 1,
  "comment": "Final approval granted"
}

Response:
{
  "success": true
}
```

### Revert NCP Status (Super Admin only)
```
PUT /api/ncp/{id}/revert-status
Content-Type: application/json

{
  "status": "pending"
}

Response:
{
  "message": "NCP status reverted successfully"
}
```

### Reassign NCP (Super Admin only)
```
PUT /api/ncp/{id}/reassign
Content-Type: application/json

{
  "assignee": "new_assignee_username",
  "role": "team_leader"
}

Response:
{
  "message": "NCP reassigned successfully"
}
```

## System Settings

### Get SKU Codes
```
GET /api/system-settings/sku-codes

Response:
[
  {
    "id": 1,
    "code": "SKU001",
    "description": "Product A"
  }
]
```

### Create SKU Code (Super Admin only)
```
POST /api/system-settings/sku-codes
Content-Type: application/json

{
  "code": "SKU002",
  "description": "Product B"
}

Response:
{
  "message": "SKU code created successfully",
  "id": 2
}
```

### Update SKU Code (Super Admin only)
```
PUT /api/system-settings/sku-codes
Content-Type: application/json

{
  "id": 1,
  "code": "SKU001-A",
  "description": "Product A Updated"
}

Response:
{
  "message": "SKU code updated successfully"
}
```

### Delete SKU Code (Super Admin only)
```
DELETE /api/system-settings/sku-codes?id=1

Response:
{
  "message": "SKU code deleted successfully"
}
```

### Get Machines
```
GET /api/system-settings/machines

Response:
[
  {
    "id": 1,
    "code": "MCH001",
    "name": "Filling Machine A"
  }
]
```

### Create Machine (Super Admin only)
```
POST /api/system-settings/machines
Content-Type: application/json

{
  "code": "MCH002",
  "name": "Capping Machine B"
}

Response:
{
  "message": "Machine created successfully",
  "id": 2
}
```

### Update Machine (Super Admin only)
```
PUT /api/system-settings/machines
Content-Type: application/json

{
  "id": 1,
  "code": "MCH001-A",
  "name": "Filling Machine A Updated"
}

Response:
{
  "message": "Machine updated successfully"
}
```

### Delete Machine (Super Admin only)
```
DELETE /api/system-settings/machines?id=1

Response:
{
  "message": "Machine deleted successfully"
}
```

### Get UOMs
```
GET /api/system-settings/uoms

Response:
[
  {
    "id": 1,
    "code": "PCS",
    "name": "Pieces"
  }
]
```

### Create UOM (Super Admin only)
```
POST /api/system-settings/uoms
Content-Type: application/json

{
  "code": "KG",
  "name": "Kilograms"
}

Response:
{
  "message": "UOM created successfully",
  "id": 2
}
```

### Update UOM (Super Admin only)
```
PUT /api/system-settings/uoms
Content-Type: application/json

{
  "id": 1,
  "code": "PCS-U",
  "name": "Pieces Updated"
}

Response:
{
  "message": "UOM updated successfully"
}
```

### Delete UOM (Super Admin only)
```
DELETE /api/system-settings/uoms?id=1

Response:
{
  "message": "UOM deleted successfully"
}
```

### Get System Setting
```
GET /api/system-settings/config?key=ncp_format

Response:
{
  "key": "ncp_format",
  "value": "YYMM-XXXX"
}
```

### Set System Setting (Super Admin only)
```
POST /api/system-settings/config
Content-Type: application/json

{
  "key": "ncp_format",
  "value": "YYYY-MM-XXXX",
  "description": "Updated NCP numbering format"
}

Response:
{
  "message": "System setting updated successfully"
}
```

## Monitoring

### Get Audit Logs (Super Admin only)
```
GET /api/audit-log

Response:
[
  {
    "id": 1,
    "ncp_id": "2301-0001",
    "changed_by": "super_admin",
    "changed_at": "2023-01-01T10:30:00.000Z",
    "field_changed": "status",
    "old_value": "pending",
    "new_value": "qa_approved",
    "description": "Status updated by super_admin"
  }
]
```

### Get System Logs (Super Admin only)
```
GET /api/system-logs

Response:
[
  {
    "id": 1,
    "level": "info",
    "message": "User login successful",
    "details": "User super_admin logged in",
    "created_at": "2023-01-01T10:30:00.000Z"
  }
]
```

### Get API Keys (Super Admin only)
```
GET /api/api-keys

Response:
[
  {
    "id": 1,
    "key": "sk_1234567890abcdef",
    "service_name": "Mobile App",
    "permissions": "[\"read\", \"write\"]",
    "created_at": "2023-01-01T10:30:00.000Z",
    "last_used_at": null,
    "is_active": true
  }
]
```

### Create API Key (Super Admin only)
```
POST /api/api-keys
Content-Type: application/json

{
  "serviceName": "Analytics Service",
  "permissions": ["read"]
}

Response:
{
  "key": "sk_new_api_key_here"
}
```

### Delete API Key (Super Admin only)
```
DELETE /api/api-keys/{id}

Response:
{
  "message": "API key deleted successfully"
}
```

### Get Analytics Data (Super Admin only)
```
GET /api/analytics

Response:
{
  "monthlyData": [...],
  "averageApprovalTime": 2.5,
  "statusDistribution": [...],
  "topSubmitters": [...],
  "ncpStats": {...}
}
```

## Dashboard

### Get Dashboard Stats
```
GET /api/dashboard/stats

Response:
{
  "data": {
    "stats": {
      "total": 100,
      "pending": 10,
      "approved": 70,
      "processed": 20,
      "qaApproved": 30,
      "tlProcessed": 20,
      "process_approved": 15,
      "manager_approved": 55,
      "rejected": 5
    },
    "charts": {
      "monthly": [...],
      "statusDistribution": [...],
      "topSubmitters": [...]
    }
  }
}
```

### Get Dashboard NCPs
```
GET /api/dashboard/ncps?type=all|pending

Response:
{
  "data": [...]
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow this format:
```json
{
  "error": "Error message describing the problem"
}
```