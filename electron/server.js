/**
 * Backend Server Process Manager for Electron
 * Manages the Express + Puppeteer server lifecycle
 * NO CHANGES TO EXISTING SERVER LOGIC
 */

const { spawn } = require('child_process');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');
const os = require('os');
const { checkWindowsPrerequisites } = require('./windows-server-startup.js');

let serverProcess = null;

// Use a function to check if in dev mode (app.isPackaged may not be available at module load time)
function isDev() {
  return !app.isPackaged;
}

/**
 * Check if server is responding
 */
async function checkServerHealth(maxRetries = 10, retryDelay = 1000) {
  const http = require('http');

  for (let i = 0; i < maxRetries; i++) {
    try {
      await new Promise((resolve, reject) => {
        // Use 127.0.0.1 instead of localhost for Windows compatibility
        const req = http.get('https://autojobzy.com/api/health', (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Server returned status ${res.statusCode}`));
          }
        });

        req.on('error', reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      });

      debugLog(`✓ Server health check passed (attempt ${i + 1}/${maxRetries})`);
      return true;
    } catch (error) {
      debugLog(`Health check failed (attempt ${i + 1}/${maxRetries}): ${error.message}`);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  return false;
}

// Debug log file
const debugLogPath = path.join(os.tmpdir(), 'autojobzy-server-debug.log');

function debugLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    fs.appendFileSync(debugLogPath, logMessage);
  } catch (e) {
    // Ignore write errors
  }
}

/**
 * Start the backend server process
 * Uses existing server/index.js WITHOUT MODIFICATIONS
 */
async function startBackendServer() {
  return new Promise((resolve, reject) => {
    let settled = false; // Track if promise is already resolved/rejected

    try {
      const devMode = isDev();

      debugLog('=== Starting Backend Server ===');
      debugLog(`isDev(): ${devMode}`);
      debugLog(`app.isPackaged: ${app.isPackaged}`);
      debugLog(`process.resourcesPath: ${process.resourcesPath}`);
      debugLog(`__dirname: ${__dirname}`);

      // Determine server path and working directory
      // In production, try multiple locations for Windows compatibility
      let serverPath;
      let workingDir;

      if (devMode) {
        serverPath = path.join(__dirname, '../server/index.js');
        workingDir = path.join(__dirname, '..');
        debugLog(`Dev mode: server path set to ${serverPath}`);
        debugLog(`Dev mode: working dir set to ${workingDir}`);
      } else {
        // Try multiple paths for production (Windows/Mac compatibility)
        debugLog('=== SEARCHING FOR SERVER FILES ===');
        const possiblePaths = [
          path.join(process.resourcesPath, 'server/index.js'),
          path.join(process.resourcesPath, 'app.asar.unpacked/server/index.js'),
          path.join(__dirname, '../server/index.js'),
          path.join(process.resourcesPath, 'app/server/index.js'), // Additional path for extraResources
        ];

        debugLog(`Checking ${possiblePaths.length} possible server locations...`);

        for (let i = 0; i < possiblePaths.length; i++) {
          const testPath = possiblePaths[i];
          const exists = fs.existsSync(testPath);
          debugLog(`[${i + 1}/${possiblePaths.length}] ${exists ? '✓ FOUND' : '✗ NOT FOUND'}: ${testPath}`);

          if (exists) {
            serverPath = testPath;
            workingDir = path.dirname(path.dirname(testPath));
            debugLog(`✓ Using server file: ${serverPath}`);
            debugLog(`✓ Working directory: ${workingDir}`);
            break;
          }
        }

        // Fallback
        if (!serverPath) {
          serverPath = path.join(process.resourcesPath, 'server/index.js');
          workingDir = process.resourcesPath;
          debugLog('⚠️  WARNING: Using fallback paths (server file not found in any expected location)');
          debugLog(`Fallback server path: ${serverPath}`);
          debugLog(`Fallback working dir: ${workingDir}`);
        }
      }

      debugLog(`Server path: ${serverPath}`);
      debugLog(`Working directory: ${workingDir}`);
      debugLog(`Node.js path: ${process.execPath}`);

      // Run Windows-specific prerequisite checks
      if (process.platform === 'win32') {
        debugLog('=== Running Windows Prerequisite Checks ===');
        try {
          const prereqResult = checkWindowsPrerequisites(workingDir, serverPath);

          if (!prereqResult.allPassed) {
            const failedChecks = prereqResult.checks.filter(c => !c.passed);
            debugLog(`WARNING: ${failedChecks.length} prerequisite check(s) failed`);
            failedChecks.forEach(check => {
              debugLog(`  - ${check.name}: ${check.detail || 'FAILED'}`);
            });
          } else {
            debugLog('✓ All Windows prerequisite checks passed');
          }
        } catch (prereqError) {
          debugLog(`WARNING: Prerequisite check failed: ${prereqError.message}`);
          // Continue anyway
        }
      }

      // Check if server file exists
      if (!fs.existsSync(serverPath)) {
        const error = `Server file not found at: ${serverPath}`;
        debugLog(`ERROR: ${error}`);
        throw new Error(error);
      }
      debugLog('✓ Server file exists');

      // Check if working directory exists
      if (!fs.existsSync(workingDir)) {
        const error = `Working directory not found: ${workingDir}`;
        debugLog(`ERROR: ${error}`);
        throw new Error(error);
      }
      debugLog('✓ Working directory exists');

      // Check for .env file
      const envPath = path.join(workingDir, '.env');
      const envProductionPath = path.join(workingDir, '.env.production');
      const hasEnv = fs.existsSync(envPath) || fs.existsSync(envProductionPath);
      debugLog(`.env file check: ${envPath} exists = ${fs.existsSync(envPath)}`);
      debugLog(`.env.production file check: ${envProductionPath} exists = ${fs.existsSync(envProductionPath)}`);

      if (!hasEnv) {
        console.warn('⚠️  Warning: No .env or .env.production file found');
        console.warn('   Database and API keys may not be configured');
        debugLog('WARNING: No .env file found');
      }

      console.log('Starting backend server from:', serverPath);
      console.log('Working directory:', workingDir);
      console.log('Using Node.js from:', process.execPath);

      // Use Electron's built-in Node.js instead of system node
      // This ensures we don't get "node ENOENT" errors
      debugLog('Spawning server process...');

      // Prepare environment with ES modules support
      const serverEnv = {
        ...process.env,
        NODE_ENV: devMode ? 'development' : 'production',
        ELECTRON_RUN_AS_NODE: '1', // Run as Node.js, not Electron
        // Enable ES modules - critical for Windows
        NODE_OPTIONS: '--no-warnings',
      };

      // On Windows, we need to ensure proper module resolution
      if (process.platform === 'win32') {
        debugLog('Windows detected: configuring ES modules support');
        // Add experimental-specifier-resolution only if needed
        serverEnv.NODE_OPTIONS = '--no-warnings --experimental-specifier-resolution=node';
      }

      // CRITICAL: Ensure package.json with "type": "module" exists in server directory
      const serverDir = path.dirname(serverPath);
      const serverPackageJsonPath = path.join(serverDir, 'package.json');

      if (!fs.existsSync(serverPackageJsonPath)) {
        debugLog(`WARNING: server/package.json not found at ${serverPackageJsonPath}`);
        debugLog('Creating package.json with type: module');
        try {
          fs.writeFileSync(serverPackageJsonPath, JSON.stringify({ type: 'module' }, null, 2));
          debugLog('✓ Created server/package.json');
        } catch (err) {
          debugLog(`ERROR: Failed to create package.json: ${err.message}`);
        }
      } else {
        debugLog(`✓ server/package.json exists at ${serverPackageJsonPath}`);
      }

      serverProcess = spawn(process.execPath, [serverPath], {
        cwd: workingDir, // Set working directory so .env is found
        env: serverEnv,
        stdio: ['inherit', 'pipe', 'pipe'], // Capture stdout and stderr
      });

      debugLog(`✓ Server process spawned with PID: ${serverProcess.pid}`);

      // Capture and log stdout
      if (serverProcess.stdout) {
        serverProcess.stdout.on('data', (data) => {
          const output = data.toString().trim();
          console.log(`[Backend] ${output}`);
          debugLog(`[STDOUT] ${output}`);
        });
      }

      // Capture and log stderr
      if (serverProcess.stderr) {
        serverProcess.stderr.on('data', (data) => {
          const output = data.toString().trim();
          console.error(`[Backend Error] ${output}`);
          debugLog(`[STDERR] ${output}`);

          // Check for critical errors
          if (output.includes('EADDRINUSE')) {
            console.error('❌ Port 5000 is already in use');
            console.error('   Another instance may be running');
          } else if (output.includes('Cannot find module')) {
            console.error('❌ Missing Node.js dependencies');
            console.error('   Try reinstalling the application');
          } else if (output.includes('ECONNREFUSED')) {
            console.error('❌ Database connection failed');
            console.error('   Check database credentials in .env file');
          }
        });
      }

      // Handle process events
      serverProcess.on('error', (error) => {
        const errorMsg = `Backend server error: ${error.message}`;
        console.error(errorMsg);
        debugLog(`ERROR: ${errorMsg}`);
        if (!settled) {
          settled = true;
          reject(error);
        }
      });

      serverProcess.on('exit', (code) => {
        const exitMsg = `Backend server exited with code ${code}`;
        console.log(exitMsg);
        debugLog(exitMsg);
        if (code !== 0 && code !== null && !settled) {
          settled = true;
          reject(new Error(`Server exited with code ${code}`));
        }
        serverProcess = null;
      });

      // Wait for server to be healthy before resolving
      // Windows takes longer to start the server (especially first time)
      debugLog('Waiting for server to respond to health checks...');
      debugLog('This may take 15-30 seconds on Windows (especially first run)...');

      // On Windows, give more time before starting health checks
      const initialDelay = process.platform === 'win32' ? 5000 : 2000;
      const maxRetries = process.platform === 'win32' ? 30 : 15; // Windows gets more retries
      const retryDelay = 1000;

      setTimeout(async () => {
        if (!settled) {
          debugLog(`Starting health checks (${maxRetries} attempts, ${retryDelay}ms interval)...`);
          const isHealthy = await checkServerHealth(maxRetries, retryDelay);
          if (isHealthy && serverProcess && !serverProcess.killed) {
            settled = true;
            debugLog('✓ Server is healthy and ready');
            resolve();
          } else {
            settled = true;
            const error = isHealthy
              ? 'Server process died unexpectedly'
              : 'Server failed health checks after 30 attempts';
            debugLog(`ERROR: ${error}`);

            // Provide detailed error information
            if (!isHealthy) {
              debugLog('TROUBLESHOOTING:');
              debugLog('1. Check if port 5000 is already in use');
              debugLog('2. Check database connection in .env.production');
              debugLog('3. Check Windows Firewall settings');
              debugLog('4. Review full log file for details');
            }

            reject(new Error(error));
          }
        }
      }, initialDelay);
    } catch (error) {
      if (!settled) {
        settled = true;
        reject(error);
      }
    }
  });
}

/**
 * Stop the backend server process
 */
async function stopBackendServer() {
  if (serverProcess && !serverProcess.killed) {
    console.log('Stopping backend server...');
    serverProcess.kill('SIGTERM');

    // Force kill if not stopped after 5 seconds
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        console.log('Force killing backend server...');
        serverProcess.kill('SIGKILL');
      }
    }, 5000);
  }
}

module.exports = {
  startBackendServer,
  stopBackendServer,
};
