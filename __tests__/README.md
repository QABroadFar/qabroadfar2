# Testing

This project uses a custom Node.js test runner to ensure the quality and reliability of the codebase.

## Test Structure

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
└── README.md               # This file
```

## Running Tests

### All Tests

Run all tests with our comprehensive test runner:
```bash
npm run test:all
```

### Simple Tests

Run basic file existence tests:
```bash
npm run test:simple
```

## Test Types

1. **File Existence Tests** - Verifies that required files exist in the project
2. **Database Connection Tests** - Tests that the database can be connected to and contains the expected tables
3. **Authentication Tests** - Tests the user authentication functionality
4. **NCP Function Tests** - Tests the Non-Conformance Report functions
5. **API Route Tests** - Tests that API route files exist and have expected structure

## Test Implementation Details

### Custom Test Runner

The test runner (`test-runner.js`) executes all tests and provides clear pass/fail output:

```
🚀 Starting all tests...

🧪 Running Basic File Existence Tests...
Running basic file existence tests...
✓ lib/database.ts file exists
✓ app/api/auth/login/route.ts file exists
All basic tests passed!
✅ Basic File Existence Tests passed

🧪 Running Database Connection Tests...
🧪 Testing database functions...
✅ Database connection successful
✅ Users table exists
✅ Users table contains 11 users
✅ NCP reports table exists
🧪 Testing database functions completed!
✅ Database Connection Tests passed

🏁 Test Results: 5/5 tests passed
🎉 All tests passed!
```

### Test File Structure

Each test file follows a simple pattern:
1. Import required modules
2. Implement test functions that use console.log for output and console.assert for assertions
3. Handle errors appropriately
4. Provide clear success/failure indicators

## Writing New Tests

1. Create a new test file in the appropriate directory under `__tests__/`
2. Follow the pattern of existing test files
3. Add the test to the test runner in `__tests__/test-runner.js`
4. Run tests to verify they work correctly

## Continuous Integration

Tests are automatically run in the CI pipeline to ensure that changes don't break existing functionality:

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

## Additional Test Scripts

The project also includes additional test scripts in the `scripts/` directory:
- Database verification and initialization scripts
- Workflow simulation scripts
- User management test scripts
- Authentication test scripts

These can be run directly with Node.js:
```bash
node scripts/test-login.cjs
node scripts/test-complete-workflow.js
node scripts/verify-database.js
```