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

let serverProcess = null;

// Use a function to check if in dev mode (app.isPackaged may not be available at module load time)
function isDev() {
  return !app.isPackaged;
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
      // In production, server files are in Resources/server/ (via extraResources)
      const serverPath = devMode
        ? path.join(__dirname, '../server/index.js')
        : path.join(process.resourcesPath, 'server/index.js');

      const workingDir = devMode
        ? path.join(__dirname, '..')
        : process.resourcesPath; // .env is in Resources/ root

      debugLog(`Server path: ${serverPath}`);
      debugLog(`Working directory: ${workingDir}`);
      debugLog(`Node.js path: ${process.execPath}`);

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

      console.log('Starting backend server from:', serverPath);
      console.log('Working directory:', workingDir);
      console.log('Using Node.js from:', process.execPath);

      // Use Electron's built-in Node.js instead of system node
      // This ensures we don't get "node ENOENT" errors
      debugLog('Spawning server process...');
      serverProcess = spawn(process.execPath, [serverPath], {
        cwd: workingDir, // Set working directory so .env is found
        env: {
          ...process.env,
          NODE_ENV: devMode ? 'development' : 'production',
          ELECTRON_RUN_AS_NODE: '1', // Run as Node.js, not Electron
        },
        stdio: ['inherit', 'pipe', 'pipe'], // Capture stdout and stderr
      });

      debugLog(`✓ Server process spawned with PID: ${serverProcess.pid}`);

      // Capture and log stdout
      if (serverProcess.stdout) {
        serverProcess.stdout.on('data', (data) => {
          console.log(`[Backend] ${data.toString().trim()}`);
        });
      }

      // Capture and log stderr
      if (serverProcess.stderr) {
        serverProcess.stderr.on('data', (data) => {
          console.error(`[Backend Error] ${data.toString().trim()}`);
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

      // Give server time to start
      setTimeout(() => {
        if (!settled) {
          if (serverProcess && !serverProcess.killed) {
            settled = true;
            resolve();
          } else {
            settled = true;
            reject(new Error('Server failed to start'));
          }
        }
      }, 2000);
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
