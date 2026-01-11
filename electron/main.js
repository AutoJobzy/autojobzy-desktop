/**
 * Electron Main Process
 * Manages application window and backend server lifecycle
 * NO CHANGES TO EXISTING BUSINESS LOGIC - Pure wrapper
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const { startBackendServer, stopBackendServer } = require('./server.js');
const { initLogger, closeLogger } = require('./logger.js');

let mainWindow = null;
let serverProcess = null;
let logFilePath = null;

// Configuration
const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_SERVER_URL = 'http://localhost:5173';
const SERVER_PORT = process.env.PORT || 5000;

// Initialize logger immediately
try {
  logFilePath = initLogger();
  console.log('📝 Logger initialized. Log file:', logFilePath);
} catch (error) {
  console.error('Failed to initialize logger:', error);
}

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: 'AutoJobzy',
    autoHideMenuBar: true, // Hide menu bar for cleaner look
  });

  // Load the app
  if (isDev) {
    // Development: Load from Vite dev server
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools(); // Open DevTools in development
  } else {
    // Production: Load from built files
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading index.html from:', indexPath);
    mainWindow.loadFile(indexPath);
    // DevTools disabled in production (users can press F12 if needed)
    // mainWindow.webContents.openDevTools();
  }

  // Log any load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent navigation away from the app
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Allow navigation within the app
    if (!url.startsWith(VITE_DEV_SERVER_URL) && !url.startsWith('file://')) {
      event.preventDefault();
    }
  });
}

/**
 * App lifecycle: Ready
 */
app.whenReady().then(async () => {
  console.log('🚀 Electron app starting...');

  // Create window first so we can show errors
  createWindow();

  // Start backend server ONLY in production mode
  // In development, concurrently already starts the server
  if (!isDev) {
    try {
      console.log('🔄 Starting backend server...');
      await startBackendServer();
      console.log(`✅ Backend server started on http://localhost:${SERVER_PORT}`);
    } catch (error) {
      console.error('❌ Failed to start backend server:', error);
      console.error('Log file:', logFilePath);

      // Just log the error, don't show blocking dialog
      // App will continue to work if server recovers or is already running
    }
  } else {
    console.log('⚡ Development mode: Using external backend server on port', SERVER_PORT);
  }

  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * App lifecycle: All windows closed
 */
app.on('window-all-closed', () => {
  // On macOS, apps typically stay active until Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * App lifecycle: Before quit
 */
app.on('before-quit', async () => {
  console.log('🛑 Application shutting down...');

  // Only stop server if we started it (production mode)
  if (!isDev) {
    console.log('🛑 Shutting down backend server...');
    await stopBackendServer();
  }

  // Close logger
  closeLogger();
});

/**
 * IPC Handlers - Minimal bridge for desktop-specific features
 */

// Get app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Check if running in Electron
ipcMain.handle('is-electron', () => {
  return true;
});

// Get server status
ipcMain.handle('get-server-status', () => {
  return {
    running: serverProcess !== null,
    port: SERVER_PORT,
  };
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
