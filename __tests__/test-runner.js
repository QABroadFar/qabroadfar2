// Test runner that executes all tests
const { spawn } = require('child_process');

async function runTest(name, command, args) {
  console.log(`\n🧪 Running ${name}...`);
  
  return new Promise((resolve) => {
    const testProcess = spawn(command, args, { cwd: process.cwd() });
    
    let output = '';
    
    testProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    testProcess.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    testProcess.on('close', (code) => {
      console.log(output);
      if (code === 0) {
        console.log(`✅ ${name} passed`);
      } else {
        console.log(`❌ ${name} failed with exit code ${code}`);
      }
      resolve(code === 0);
    });
  });
}

async function runAllTests() {
  console.log("🚀 Starting all tests...\n");
  
  const tests = [
    {
      name: "Basic File Existence Tests",
      command: "node",
      args: ["__tests__/basic-file-tests.js"]
    },
    {
      name: "Database Connection Tests",
      command: "node",
      args: ["__tests__/database-connection.test.js"]
    },
    {
      name: "Authentication Function Tests",
      command: "node",
      args: ["__tests__/authentication.test.js"]
    },
    {
      name: "NCP Function Tests",
      command: "node",
      args: ["__tests__/ncp-functions.test.js"]
    },
    {
      name: "API Route Tests",
      command: "node",
      args: ["__tests__/api-routes.test.js"]
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    const passed = await runTest(test.name, test.command, test.args);
    if (passed) {
      passedTests++;
    }
  }
  
  console.log(`\n🏁 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log("🎉 All tests passed!");
    process.exit(0);
  } else {
    console.log("❌ Some tests failed!");
    process.exit(1);
  }
}

runAllTests();