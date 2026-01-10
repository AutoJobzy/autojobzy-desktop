/**
 * Backend Server Process Manager for Electron
 * Manages the Express + Puppeteer server lifecycle
 * NO CHANGES TO EXISTING SERVER LOGIC
 */

const { spawn } = require('child_process');
const path = require('path');

let serverProcess = null;
const isDev = process.env.NODE_ENV === 'development';

/**
 * Start the backend server process
 * Uses existing server/index.js WITHOUT MODIFICATIONS
 */
async function startBackendServer() {
  return new Promise((resolve, reject) => {
    try {
      // Determine server path and working directory
      const serverPath = isDev
        ? path.join(__dirname, '../server/index.js')
        : path.join(process.resourcesPath, 'app.asar.unpacked/server/index.js');

      const workingDir = isDev
        ? path.join(__dirname, '..')
        : process.resourcesPath;

      console.log('Starting backend server from:', serverPath);
      console.log('Working directory:', workingDir);
      console.log('Using Node.js from:', process.execPath);

      // Use Electron's built-in Node.js instead of system node
      // This ensures we don't get "node ENOENT" errors
      serverProcess = spawn(process.execPath, [serverPath], {
        cwd: workingDir, // Set working directory so .env is found
        env: {
          ...process.env,
          NODE_ENV: isDev ? 'development' : 'production',
          ELECTRON_RUN_AS_NODE: '1', // Run as Node.js, not Electron
        },
        stdio: ['inherit', 'inherit', 'inherit'], // Inherit stdio to see server logs
      });

      // Handle process events
      serverProcess.on('error', (error) => {
        console.error('Backend server error:', error);
        reject(error);
      });

      serverProcess.on('exit', (code) => {
        console.log(`Backend server exited with code ${code}`);
        serverProcess = null;
      });

      // Give server time to start
      setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          resolve();
        } else {
          reject(new Error('Server failed to start'));
        }
      }, 2000);
    } catch (error) {
      reject(error);
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
