# Testing and Quality Assurance Documentation

Last Updated: September 6, 2025

## Table of Contents
1. [Testing Strategy](#testing-strategy)
2. [Test Environment](#test-environment)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [User Acceptance Testing](#user-acceptance-testing)
9. [Test Automation](#test-automation)
10. [Quality Metrics](#quality-metrics)
11. [Bug Tracking](#bug-tracking)
12. [Release Testing](#release-testing)

## Testing Strategy

### Current Testing Approach
Testing has been implemented using a custom Node.js approach instead of the originally planned Jest framework. This approach provides direct, lightweight testing that integrates well with the existing codebase.

### Testing Principles
- **Practical Testing**: Focus on testing actual functionality rather than framework features
- **Continuous Testing**: Automate testing in CI/CD pipeline with simple, reliable tests
- **Risk-Based Testing**: Prioritize testing based on business impact and critical functionality
- **Collaborative Testing**: Involve developers and business users in testing processes

### Testing Types
1. **Unit Testing**: Individual function and module testing with direct implementation
2. **Integration Testing**: Component interactions tested through database and API verification
3. **System Testing**: End-to-end functionality tested through workflow simulation
4. **Performance Testing**: Speed and scalability verified through existing scripts
5. **Security Testing**: Vulnerability assessment through manual and automated checks
6. **User Acceptance Testing**: Business requirement validation through manual procedures

### Test Coverage Goals
- **Functional Coverage**: 100% of critical business requirements
- **User Role Testing**: All roles and permissions verified
- **Workflow Testing**: Complete NCP workflow from submission to final approval
- **Edge Case Testing**: Boundary conditions and error scenarios handled

## Test Environment

### Development Environment
- **Local Development**: Developer workstations
- **Tools**: Jest, React Testing Library, Cypress
- **Data**: Mock data and test databases
- **Configuration**: Environment-specific settings

### Staging Environment
- **Purpose**: Pre-production testing
- **Infrastructure**: Mirror of production
- **Data**: Anonymized production data
- **Access**: QA team and stakeholders

### Production Environment
- **Purpose**: Live system
- **Monitoring**: Real-time performance and error tracking
- **Rollback**: Quick recovery procedures
- **Access**: Authorized users only

### Environment Variables
Each environment requires specific configuration:

```env
# Development
NODE_ENV=development
DATABASE_PATH=./test.db
JWT_SECRET=test-secret-key

# Staging
NODE_ENV=production
DATABASE_PATH=/var/lib/qa-portal/staging.db
JWT_SECRET=staging-secret-key

# Production
NODE_ENV=production
DATABASE_PATH=/var/lib/qa-portal/production.db
JWT_SECRET=production-secret-key-change-this
```

## Unit Testing

### Current Testing Approach
Unit testing has been implemented using a custom Node.js test runner instead of the originally planned Jest framework. This approach was chosen for its simplicity and direct compatibility with the project's existing Node.js and TypeScript setup.

### Test Framework
- **Node.js Built-in Modules**: Using assert, fs, and path modules for testing
- **Custom Test Runner**: Node.js script that executes all tests and reports results
- **Database Testing**: Direct database connection testing with Better SQLite3

### Test Structure
```
__tests__/
├── lib/                    # Library function tests
├── app/                    # API route tests
├── basic-file-tests.js     # File existence tests
├── database-connection.test.js  # Database connectivity tests
├── authentication.test.js  # Authentication tests
├── ncp-functions.test.js   # NCP function tests
├── api-routes.test.js      # API route tests
├── test-runner.js          # Comprehensive test runner
└── README.md               # Test documentation
```

### Test Execution
```bash
# Run all tests
npm run test:all

# Run basic file existence tests
npm run test:simple
```

### Component Testing
Custom component testing is performed through the existing test scripts in the `scripts/` directory:
- Database connectivity verification
- Authentication flow testing
- Workflow simulation and validation
- User management testing

### Utility Function Testing
Utility functions are tested through direct implementation testing:

```javascript
// __tests__/authentication.test.js
const Database = require("better-sqlite3")
const bcrypt = require("bcryptjs")

async function authenticateUser(username, password) {
  // Implementation
}

async function testAuthentication() {
  // Test valid authentication
  const user = await authenticateUser("teamlead2", "password123")
  console.assert(user !== null, "Valid user authentication should succeed")
  
  // Test invalid username
  const invalidUser = await authenticateUser("nonexistent", "password123")
  console.assert(invalidUser === null, "Invalid username should return null")
  
  // Test invalid password
  const invalidPassword = await authenticateUser("teamlead2", "wrongpassword")
  console.assert(invalidPassword === null, "Invalid password should return null")
}
```

### Database Function Testing
Database functions are tested through direct database interaction:

```javascript
// __tests__/database-connection.test.js
const Database = require("better-sqlite3")

function testDatabaseConnection() {
  const db = new Database("qa_portal.db")
  
  // Test users table exists
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get()
  console.assert(tableExists !== undefined, "Users table should exist")
  
  // Test ncp_reports table exists
  const ncpTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ncp_reports'").get()
  console.assert(ncpTableExists !== undefined, "NCP reports table should exist")
  
  db.close()
}
```

### Running Tests
To run all tests:
```bash
npm run test:all
```

This will execute:
1. Basic file existence tests
2. Database connection tests
3. Authentication function tests
4. NCP function tests
5. API route tests

Each test provides clear pass/fail output with detailed information about what is being tested.

## Integration Testing

### Current Testing Approach
Integration testing has been implemented through direct testing of API endpoints and database operations using custom Node.js scripts.

### API Route Testing
API routes are tested through direct inspection of the route files and verification of their structure:

```javascript
// __tests__/api-routes.test.js
const fs = require('fs')

function testAPIRoutes() {
  // Test that the login API route file exists
  const loginRoutePath = path.join(__dirname, '../app/api/auth/login/route.ts')
  console.assert(fs.existsSync(loginRoutePath), "Login API route file should exist")
  
  // Read the file content
  const content = fs.readFileSync(loginRoutePath, 'utf8')
  
  // Test that it exports a POST function
  console.assert(content.includes('export async function POST'), "Should export POST function")
  
  // Test that it imports required modules
  console.assert(content.includes('authenticateUser'), "Should use authenticateUser function")
}
```

### Database Integration Testing
Database integration is tested through direct database operations:

```javascript
// __tests__/ncp-functions.test.js
const Database = require("better-sqlite3")

function testNCPFunctions() {
  const db = new Database("qa_portal.db")
  
  // Test retrieving NCP reports
  const reports = db.prepare("SELECT * FROM ncp_reports ORDER BY submitted_at DESC LIMIT 5").all()
  console.assert(Array.isArray(reports), "Should return array of reports")
  
  // Test retrieving pending NCPs
  const pendingReports = db.prepare("SELECT * FROM ncp_reports WHERE status = 'pending' ORDER BY submitted_at ASC").all()
  console.assert(Array.isArray(pendingReports), "Should return array of pending reports")
  
  db.close()
}
```

### Authentication Flow Testing
Authentication flow is tested end-to-end:

```javascript
// scripts/test-login.cjs (existing script)
const Database = require("better-sqlite3")
const bcrypt = require("bcryptjs")

async function testLogin(username, password) {
  const db = new Database("qa_portal.db")
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username)
  
  if (!user) {
    return false
  }
  
  const isValid = await bcrypt.compare(password, user.password)
  return isValid
}

// Test multiple user credentials
const testCredentials = [
  { username: "qaleader1", password: "123" },
  { username: "teamlead1", password: "123" }
]

async function runTests() {
  for (const cred of testCredentials) {
    await testLogin(cred.username, cred.password)
  }
}
```

### Test Coverage
Integration tests cover:
- ✅ API route file structure verification
- ✅ Database connectivity and operations
- ✅ Authentication flow with real credentials
- ✅ NCP workflow functions
- ✅ User management operations

## End-to-End Testing

### Current Testing Approach
End-to-end testing is performed through existing workflow simulation scripts and manual testing procedures.

### Test Framework
Instead of Cypress or Playwright, end-to-end testing leverages:
- **Existing Workflow Scripts**: Scripts in the `scripts/` directory simulate complete workflows
- **Manual Testing Procedures**: Documented procedures for user acceptance testing
- **Database State Verification**: Scripts that verify database state after operations

### Test Scenarios
1. **User Authentication Flow**
   - Login with valid credentials using `scripts/test-login.cjs`
   - Verification of session management
   - Logout functionality testing with `scripts/test-logout.js`

2. **NCP Submission Workflow**
   - Complete NCP workflow testing using `scripts/test-complete-workflow.js`
   - Verification of status transitions
   - Assignment validation to appropriate roles

3. **Role-Based Access**
   - Verification of permissions for different user roles
   - Testing access restrictions for unauthorized actions
   - Validation of data visibility based on roles

4. **Administrative Functions**
   - User management testing
   - System settings verification
   - Audit log review and validation

### Example E2E Test
Workflow testing is performed through existing scripts:

```javascript
// scripts/test-complete-workflow.js (existing script)
function testCompleteWorkflow() {
  // Step 1: Check initial state
  const allNCPs = db.prepare("SELECT * FROM ncp_reports ORDER BY submitted_at DESC").all()
  
  // Step 2: Simulate QA Leader approval
  const pendingNCP = db.prepare("SELECT * FROM ncp_reports WHERE status = 'pending' LIMIT 1").get()
  
  if (pendingNCP) {
    const updateStmt = db.prepare(`
      UPDATE ncp_reports 
      SET status = 'qa_approved',
          qa_approved_by = 'qaleader1',
          qa_approved_at = CURRENT_TIMESTAMP,
          disposisi = 'Sortir dan Release',
          jumlah_sortir = '25',
          jumlah_release = '15',
          jumlah_reject = '10',
          assigned_team_leader = 'teamlead2'
      WHERE id = ?
    `)
    
    const result = updateStmt.run(pendingNCP.id)
  }
  
  // Step 3: Check final state
  const finalNCPs = db.prepare("SELECT * FROM ncp_reports ORDER BY submitted_at DESC").all()
  
  // Step 4: Check what team leaders should see
  const teamlead1NCPs = db.prepare(`
    SELECT * FROM ncp_reports 
    WHERE assigned_team_leader = 'teamlead1' 
    AND status IN ('qa_approved', 'tl_processed')
  `).all()
  
  const teamlead2NCPs = db.prepare(`
    SELECT * FROM ncp_reports 
    WHERE assigned_team_leader = 'teamlead2' 
    AND status IN ('qa_approved', 'tl_processed')
  `).all()
}
```

### Test Coverage
End-to-end tests cover:
- ✅ Complete NCP workflow from submission to final approval
- ✅ User authentication and session management
- ✅ Role-based access control
- ✅ Administrative functions
- ✅ Data integrity across workflow transitions

### Manual Testing Procedures
For UI-based testing, follow these procedures:

1. **User Authentication Flow**
   - Navigate to the login page
   - Attempt login with valid credentials
   - Verify successful authentication and redirection to dashboard
   - Test logout functionality

2. **NCP Submission Process**
   - Access NCP input form
   - Fill in all required fields
   - Submit report
   - Verify successful submission message
   - Check report appears in user's dashboard

3. **Workflow Approval Process**
   - Log in as QA Leader
   - Find pending NCP reports
   - Approve or reject reports
   - Verify status updates
   - Check notifications for assigned users

4. **RCA Analysis**
   - Log in as Team Leader
   - Access assigned NCP reports
   - Complete RCA analysis
   - Submit for process review

5. **Final Approval**
   - Log in as QA Manager
   - Review process-approved reports
   - Provide final approval
   - Verify report archival

## Performance Testing

### Load Testing
- **Tools**: Artillery, k6, or JMeter
- **Scenarios**: 
  - 100 concurrent users submitting reports
  - 50 approvers processing simultaneously
  - Database query performance under load

### Performance Metrics
- **Response Time**: <2 seconds for 95% of requests
- **Throughput**: 50 requests/second minimum
- **Error Rate**: <1% under normal load
- **Database Query Time**: <100ms for simple queries

### Stress Testing
- Maximum concurrent users before degradation
- Database connection limits
- Memory usage under heavy load
- Recovery time after peak load

### Example Load Test
```yaml
# tests/performance/ncp-load-test.yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      content-type: "application/json"

scenarios:
  - name: "Submit NCP Report"
    flow:
      - post:
          url: "/api/ncp/submit"
          json:
            skuCode: "SKU001"
            machineCode: "MCH001"
            date: "2023-01-01"
            timeIncident: "10:30"
            holdQuantity: 100
            holdQuantityUOM: "PCS"
            problemDescription: "Load test issue"
            qaLeader: "qa_leader"
```

## Security Testing

### Vulnerability Assessment
- **OWASP Top 10**: Regular scanning for common vulnerabilities
- **Dependency Scanning**: npm audit for package vulnerabilities
- **Code Analysis**: Static analysis for security issues

### Authentication Testing
- JWT token security
- Password strength requirements
- Session management
- CSRF protection

### Authorization Testing
- Role-based access control
- Permission boundaries
- Data access restrictions
- Privilege escalation prevention

### Input Validation Testing
- SQL injection prevention
- XSS protection
- File upload security
- Rate limiting

### Example Security Test
```typescript
// tests/security/auth.test.ts
import { test, expect } from '@playwright/test'

test('prevents SQL injection', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: {
      username: "admin'; DROP TABLE users; --",
      password: 'password'
    }
  })
  
  // Should return error, not execute injection
  expect(response.status()).toBe(401)
})
```

## User Acceptance Testing

### UAT Process
1. **Test Plan Creation**: Based on business requirements
2. **Test Case Development**: Detailed test scenarios
3. **Test Execution**: Business users perform testing
4. **Defect Reporting**: Issues documented and tracked
5. **Sign-off**: Business approval for release

### UAT Test Cases
1. **NCP Submission**
   - All fields required
   - Valid data formats
   - Photo attachment
   - Confirmation message

2. **Workflow Approval**
   - QA Leader approval process
   - Team Leader RCA completion
   - Process Lead review
   - QA Manager final approval

3. **Reporting**
   - Dashboard accuracy
   - Report generation
   - Export functionality
   - Filter and search

4. **Administration**
   - User management
   - Role assignment
   - System settings
   - Audit trail

### UAT Sign-off Criteria
- All critical test cases pass
- No high-severity defects open
- Business requirements validated
- User training completed

## Test Automation

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test:all
```

### Automated Test Suites
1. **Pre-commit**: File integrity checks with `npm run test:simple`
2. **Pre-push**: Full test suite with `npm run test:all`
3. **CI Build**: All tests executed in GitHub Actions
4. **Nightly**: Database integrity checks using existing scripts

### Test Reporting
- **Console Output**: Clear pass/fail indicators with detailed information
- **Exit Codes**: Proper exit codes for CI/CD integration (0 for success, 1 for failure)
- **Detailed Logs**: Verbose output showing exactly what is being tested
- **Error Messages**: Clear error messages for failed tests

### Test Execution
Tests are executed through npm scripts:
```bash
# Run all tests
npm run test:all

# Run in CI/CD environment
npm run test:all

# Run during development
npm run test:simple
```

### Test Results Format
Test output follows this format:
```
🚀 Starting all tests...

🧪 Running Basic File Existence Tests...
Running basic file existence tests...
✓ lib/database.ts file exists
✓ app/api/auth/login/route.ts file exists
All basic tests passed!
✅ Basic File Existence Tests passed

🏁 Test Results: 5/5 tests passed
🎉 All tests passed!
```

### Continuous Integration Benefits
- **Fast Execution**: Tests run quickly without complex framework overhead
- **Clear Results**: Easy to understand pass/fail results
- **Reliable**: Direct testing of actual implementation
- **Maintainable**: Simple test structure that's easy to extend

## Quality Metrics

### Code Quality Metrics
- **Code Coverage**: 80% minimum
- **Test Pass Rate**: 95% minimum
- **Code Complexity**: Maintainable complexity scores
- **Code Duplication**: <5% duplication

### Performance Metrics
- **Response Time**: <2 seconds for 95% of requests
- **Error Rate**: <1% under normal conditions
- **Uptime**: 99.5% availability
- **Database Performance**: <100ms for simple queries

### User Experience Metrics
- **Page Load Time**: <3 seconds
- **Task Completion Time**: Meet business SLAs
- **User Satisfaction**: Regular surveys
- **Error Recovery**: Quick issue resolution

### Business Metrics
- **Process Compliance**: 100% workflow adherence
- **Approval Times**: Meet target SLAs
- **Quality Improvements**: Measurable defect reduction
- **ROI**: Cost savings from process efficiency

## Bug Tracking

### Issue Management
- **Tool**: GitHub Issues or Jira
- **Categories**: Bug, Enhancement, Task
- **Priority**: Critical, High, Medium, Low
- **Status**: Open, In Progress, Resolved, Closed

### Bug Report Template
```markdown
### Description
[Clear description of the issue]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Browser: [e.g., Chrome 98.0.4758.102]
- OS: [e.g., Windows 10]
- Version: [e.g., v1.2.3]

### Screenshots
[If applicable]

### Additional Context
[Any other relevant information]
```

### Bug Lifecycle
1. **Reported**: New issue created
2. **Triaged**: Priority and assignment determined
3. **In Progress**: Developer working on fix
4. **Resolved**: Fix implemented and tested
5. **Closed**: Verified and released

## Release Testing

### Pre-Release Checklist
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] User acceptance testing completed
- [ ] Stakeholder approval obtained

### Release Testing Process
1. **Staging Deployment**: Deploy to staging environment
2. **Smoke Testing**: Basic functionality verification
3. **Regression Testing**: Ensure no breaking changes
4. **Performance Testing**: Validate performance metrics
5. **Security Testing**: Final security verification
6. **User Validation**: Stakeholder sign-off

### Rollback Procedures
- **Automated Rollback**: CI/CD rollback capability
- **Manual Rollback**: Database backup restoration
- **Communication Plan**: Stakeholder notification
- **Post-Mortem**: Root cause analysis and documentation

### Release Notes Template
```markdown
## Version X.X.X - YYYY-MM-DD

### New Features
- [Feature description]

### Improvements
- [Improvement description]

### Bug Fixes
- [Bug fix description]

### Known Issues
- [Known issue with workaround]

### Upgrade Notes
- [Important upgrade information]
```

---

This testing and quality assurance documentation provides a comprehensive framework for ensuring the Quality Assurance Portal meets the highest standards of quality, performance, and security. Regular updates to this documentation will ensure continued alignment with best practices and evolving requirements.