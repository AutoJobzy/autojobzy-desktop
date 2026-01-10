/**
 * Simple file logger for Electron
 * Logs all console output to a file for debugging
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

let logStream = null;

function initLogger() {
  try {
    // Get user data directory (where logs will be stored)
    const userDataPath = app.getPath('userData');
    const logDir = path.join(userDataPath, 'logs');

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Create log file with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const logFile = path.join(logDir, `autojobzy-${timestamp}.log`);

    // Create write stream
    logStream = fs.createWriteStream(logFile, { flags: 'a' });

    // Write initial log
    log(`AutoJobzy started at ${new Date().toISOString()}`);
    log(`Log file: ${logFile}`);
    log(`User data path: ${userDataPath}`);
    log('='.repeat(80));

    // Redirect console output
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      log(`[LOG] ${message}`);
      originalConsoleLog(...args);
    };

    console.error = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      log(`[ERROR] ${message}`);
      originalConsoleError(...args);
    };

    console.warn = (...args) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      log(`[WARN] ${message}`);
      originalConsoleWarn(...args);
    };

    return logFile;
  } catch (error) {
    console.error('Failed to initialize logger:', error);
    return null;
  }
}

function log(message) {
  if (logStream) {
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] ${message}\n`);
  }
}

function closeLogger() {
  if (logStream) {
    log('='.repeat(80));
    log(`AutoJobzy closed at ${new Date().toISOString()}`);
    logStream.end();
  }
}

module.exports = {
  initLogger,
  log,
  closeLogger
};
