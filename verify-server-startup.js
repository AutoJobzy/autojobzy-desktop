/**
 * Server Startup Verification Script
 * Run this to verify the server can start correctly
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('========================================');
console.log('Server Startup Verification');
console.log('========================================\n');

// Start the server
console.log('1. Starting server...');
const serverProcess = spawn('node', ['server/index.js'], {
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit'
});

let serverStarted = false;

// Wait a few seconds then check if server is responding
setTimeout(async () => {
  console.log('\n2. Checking if server is responding...');

  for (let i = 0; i < 10; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get('https://autojobzy.com/api/health', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode === 200) {
              console.log('✅ Server is responding!');
              console.log('Response:', data);
              serverStarted = true;
              resolve();
            } else {
              reject(new Error(`Server returned status ${res.statusCode}`));
            }
          });
        });

        req.on('error', reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      });

      break; // Success!
    } catch (error) {
      console.log(`Attempt ${i + 1}/10 failed: ${error.message}`);
      if (i < 9) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  if (serverStarted) {
    console.log('\n========================================');
    console.log('✅ VERIFICATION PASSED');
    console.log('Server started successfully!');
    console.log('========================================\n');
  } else {
    console.error('\n========================================');
    console.error('❌ VERIFICATION FAILED');
    console.error('Server did not respond to health checks');
    console.error('Check the error messages above');
    console.error('========================================\n');
  }

  // Stop the server
  console.log('3. Stopping server...');
  serverProcess.kill('SIGTERM');

  setTimeout(() => {
    if (!serverProcess.killed) {
      serverProcess.kill('SIGKILL');
    }
    process.exit(serverStarted ? 0 : 1);
  }, 2000);
}, 5000);

// Handle server exit
serverProcess.on('exit', (code) => {
  if (code !== 0 && code !== null && !serverStarted) {
    console.error(`\n❌ Server exited with code ${code}`);
    process.exit(1);
  }
});
