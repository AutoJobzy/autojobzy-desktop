/**
 * Electron Main Process
 * Manages application window and backend server lifecycle
 * NO CHANGES TO EXISTING BUSINESS LOGIC - Pure wrapper
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
// const { fork } = require('child_process'); // Not needed - using remote server
// const { startBackendServer, stopBackendServer } = require('./server.js'); // Not needed - using remote server
const { verifyPackage } = require('./verify-package.js');
const { initLogger, closeLogger } = require('./logger.js');
const fs = require('fs');
const os = require('os');

let mainWindow = null;
// let serverProcess = null; // Not needed - using remote server
let logFilePath = null;

// Debug log file (same as server.js)
const debugLogPath = path.join(os.tmpdir(), 'autojobzy-server-debug.log');

function debugLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [MAIN] ${message}\n`;
  console.log(`[MAIN] ${message}`);
  try {
    fs.appendFileSync(debugLogPath, logMessage);
  } catch (e) {
    // Ignore write errors
  }
}

// Configuration
const VITE_DEV_SERVER_URL = 'http://localhost:5173';
// const SERVER_PORT = process.env.PORT || 5000; // Not needed - using remote server

// Use a function to check if in dev mode (app.isPackaged may not be available at module load time)
function isDev() {
  return !app.isPackaged;
}

// Logger will be initialized after app is ready (moved to app.whenReady)

/**
 * Create the main application window
 */
function createWindow() {
  // Determine preload path - handle both development and production (with ASAR)
  // In production with ASAR, we need to use app.getAppPath() or resolve from resources
  const preloadPath = isDev()
    ? path.join(__dirname, 'preload.js')
    : path.join(__dirname, 'preload.js');

  console.log('🔧 Preload script path:', preloadPath);
  console.log('🔧 Preload exists:', fs.existsSync(preloadPath));

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
    title: 'AutoJobzy',
    autoHideMenuBar: true, // Hide menu bar for cleaner look
  });

  // Load the app
  if (isDev()) {
    // Development: Load from Vite dev server
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    // mainWindow.webContents.openDevTools(); // Disabled - DevTools won't auto-open
  } else {
    // Production: Load from built files
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading index.html from:', indexPath);
    mainWindow.loadFile(indexPath);

    // DevTools disabled - User can manually open with F12 or View menu if needed
    // mainWindow.webContents.on('did-finish-load', () => {
    //   mainWindow.webContents.openDevTools({ mode: 'right' });
    //   console.log('✅ DevTools opened');
    // });
  }

  // Log any load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page loaded successfully');
  });

  // Log any console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message}`);
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
  // Initialize logger (must be after app.whenReady)
  try {
    logFilePath = initLogger();
    console.log('📝 Logger initialized. Log file:', logFilePath);
  } catch (error) {
    console.error('Failed to initialize logger:', error);
  }

  // Write startup marker
  try {
    fs.writeFileSync('/tmp/autojobzy-startup.txt', `App started at ${new Date().toISOString()}\n`);
  } catch(e) {}

  debugLog('=== Electron App Starting ===');
  console.log('🚀 Electron app starting...');

  // ===== AUTO-INSTALL CHROME ON FIRST RUN =====
  console.log('\n🔍 Checking Chrome availability...');
  try {
    // Dynamic import for ES module
    const { ensureChromeAvailable } = await import('../server/utils/puppeteerHelper.js');
    const chromeStatus = await ensureChromeAvailable();

    if (chromeStatus.available) {
      console.log('✅ Chrome ready for automation');
      console.log(`📍 Chrome location: ${chromeStatus.executablePath}`);
    } else {
      console.error('⚠️  Chrome not available - automation may fail');
      console.error('   Install Google Chrome from https://www.google.com/chrome/');
    }
  } catch (error) {
    console.error('❌ Chrome check failed:', error.message);
    console.error('   Automation features may not work properly');
  }
  console.log('');

  // Create window first so we can show errors
  createWindow();

  // Log the mode detection
  const devMode = isDev();
  debugLog(`isDev(): ${devMode}`);
  debugLog(`app.isPackaged: ${app.isPackaged}`);
  debugLog(`process.resourcesPath: ${process.resourcesPath}`);
  debugLog(`__dirname: ${__dirname}`);

  console.log(`🔍 App mode: ${devMode ? 'DEVELOPMENT' : 'PRODUCTION (PACKAGED)'}`);
  console.log(`📦 app.isPackaged: ${app.isPackaged}`);

  // Verify package contents (especially in production)
  console.log('\n=== 🔍 VERIFYING PACKAGE CONTENTS ===\n');
  const verification = verifyPackage();

  if (!verification.success) {
    console.error('\n❌ Package verification failed!');
    console.error('Missing critical files - backend may not work properly');

    if (!devMode) {
      // Show warning dialog in production
      dialog.showErrorBox(
        'Package Verification Failed',
        `Some critical files are missing from the package:\n\n${verification.results.errors.join('\n')}\n\nThe app may not work properly.`
      );
    }
  } else {
    console.log('\n✅ Package verification passed - all critical files found\n');
  }

  // ===== USING REMOTE SERVER =====
  // Local backend server is DISABLED - app uses remote server at https://autojobzy.com
  console.log('🌐 Using remote backend server: https://autojobzy.com');
  console.log('✅ No local server startup required');

  debugLog('Remote server mode: Using https://autojobzy.com');
  debugLog('Local backend server startup is disabled');

  // Show remote server notification in renderer
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.executeJavaScript(`
        console.log('%c🌐 Remote Server Mode', 'color: blue; font-weight: bold; font-size: 14px');
        console.log('%cUsing backend: https://autojobzy.com', 'color: blue; font-size: 12px');
        console.log('%c✅ No local server required', 'color: green; font-size: 12px');
      `).catch(() => {});
    });
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

  // No local server to stop - using remote server
  console.log('🌐 Using remote server - no cleanup needed');

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

// Get server status (remote server mode)
ipcMain.handle('get-server-status', () => {
  return {
    running: true, // Always true - using remote server
    remote: true,
    url: 'https://autojobzy.com',
    message: 'Using remote backend server'
  };
});

/**
 * LOCAL AUTOMATION IPC HANDLERS
 * Runs Puppeteer automation locally in Electron
 */
let automationRunning = false;
let currentAutomationLogs = [];
let runNaukriAutomation = null;
let stopAutomationFn = null;
let automationModuleReady = false;
let automationModuleError = null;

// Dynamically import automation module (ES module)
async function loadAutomationModule() {
  try {
    // Use absolute path for ES module import from CommonJS
    const automationModulePath = path.join(__dirname, 'automation', 'naukriBot.mjs');
    const automationModuleUrl = `file://${automationModulePath.replace(/\\/g, '/')}`;

    debugLog(`Loading automation module from: ${automationModuleUrl}`);
    debugLog(`Module path exists: ${fs.existsSync(automationModulePath)}`);

    const automationModule = await import(automationModuleUrl);

    runNaukriAutomation = automationModule.runNaukriAutomation;
    stopAutomationFn = automationModule.stopAutomation;

    automationModuleReady = true;
    automationModuleError = null;

    debugLog('✅ Local automation module loaded successfully');
    console.log('✅ Local automation module loaded and ready');

    // Notify renderer that module is ready
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('automation-module-ready');
    }

    return true;
  } catch (error) {
    automationModuleReady = false;
    automationModuleError = error.message;

    debugLog(`❌ Failed to load automation module: ${error.message}`);
    debugLog(`Error stack: ${error.stack}`);
    console.error('❌ Failed to load automation module:', error);

    // Notify renderer about error
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('automation-module-error', error.message);
    }

    return false;
  }
}

// Load module after app is ready
app.whenReady().then(async () => {
  // Wait a bit for window to be created
  setTimeout(async () => {
    await loadAutomationModule();
  }, 2000);
});

// Check if automation module is ready
ipcMain.handle('is-automation-module-ready', () => {
  return {
    ready: automationModuleReady,
    error: automationModuleError
  };
});

// Retry loading automation module
ipcMain.handle('retry-load-automation-module', async () => {
  console.log('🔄 Retrying automation module load...');
  return await loadAutomationModule();
});

// Start automation locally
ipcMain.handle('start-automation', async (event, config) => {
  if (!runNaukriAutomation || !automationModuleReady) {
    return {
      success: false,
      error: automationModuleError || 'Automation module not loaded yet. Please try again in a few seconds.',
      needsRetry: !automationModuleReady
    };
  }

  if (automationRunning) {
    return {
      success: false,
      error: 'Automation already running'
    };
  }

  automationRunning = true;
  currentAutomationLogs = [];

  try {
    console.log('🖥️  Starting LOCAL automation with config:', config);

    // Fetch user settings from AWS backend (for credentials only)
    const API_BASE_URL = 'https://api.autojobzy.com/api';
    const token = config.token;

    if (!token) {
      throw new Error('No authentication token provided');
    }

    // Fetch Naukri credentials from AWS backend
    const fetch = (await import('node-fetch')).default;

    // Fetch job settings for credentials
    const settingsResponse = await fetch(`${API_BASE_URL}/job-settings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!settingsResponse.ok) {
      throw new Error('Failed to fetch job settings from server');
    }

    const settings = await settingsResponse.json();

    if (!settings.naukriEmail || !settings.naukriPassword) {
      throw new Error('Naukri credentials not found. Please add them in Job Profile settings.');
    }

    // ✅ FETCH FINAL URL FROM /api/filters/user
    console.log('📡 Fetching finalUrl from /api/filters/user...');
    const filtersResponse = await fetch(`${API_BASE_URL}/filters/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    let finalUrl = null;
    if (filtersResponse.ok) {
      const filtersData = await filtersResponse.json();
      finalUrl = filtersData?.data?.finalUrl || null;
      console.log('✅ FinalUrl from filters:', finalUrl ? finalUrl.substring(0, 80) + '...' : 'NOT FOUND');
    } else {
      console.log('⚠️  Failed to fetch filters, will use fallback');
    }

    // ✅ FETCH SKILLS FROM DATABASE
    console.log('📡 Fetching skills from database...');
    const skillsResponse = await fetch(`${API_BASE_URL}/job-settings/answers-data`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    let skills = [];
    if (skillsResponse.ok) {
      const answersData = await skillsResponse.json();
      skills = answersData.skills || [];
      console.log(`✅ Loaded ${skills.length} skills from database`);
    } else {
      console.log('⚠️  Failed to fetch skills');
    }

    // Add skills to settings
    settings.skills = skills;

    // Run automation locally with visible browser
    const result = await runNaukriAutomation({
      naukriEmail: settings.naukriEmail,
      naukriPassword: settings.naukriPassword,
      searchKeywords: config.searchKeywords || settings.searchKeywords || 'Software Engineer',
      maxPages: config.maxPages || 5,
      jobUrl: finalUrl || null,  // ✅ Use finalUrl from /api/filters/user
      userSettings: settings  // Pass full settings with skills for AI answers
    }, (log) => {
      // Send logs to renderer in real-time
      currentAutomationLogs.push(log);
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('automation-log', log);
      }
    });

    // ✅ Save job results to database via API
    if (result.success && result.jobResults && result.jobResults.length > 0) {
      try {
        console.log(`📤 Saving ${result.jobResults.length} job results to database...`);

        const saveResponse = await fetch(`${API_BASE_URL}/job-results/bulk`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ results: result.jobResults })
        });

        if (saveResponse.ok) {
          const saveData = await saveResponse.json();
          console.log(`✅ Successfully saved ${saveData.count} results to database`);
          result.savedToDatabase = true;
          result.savedCount = saveData.count;
        } else {
          console.warn('⚠️ Failed to save results to database:', saveResponse.statusText);
          result.savedToDatabase = false;
        }
      } catch (saveError) {
        console.error('❌ Error saving to database:', saveError.message);
        result.savedToDatabase = false;
        result.saveError = saveError.message;
      }
    } else {
      console.log('ℹ️ No job results to save to database');
    }

    automationRunning = false;
    return result;

  } catch (error) {
    console.error('Automation error:', error);
    automationRunning = false;
    return {
      success: false,
      error: error.message,
      logs: currentAutomationLogs
    };
  }
});

// Get current automation logs
ipcMain.handle('get-automation-logs', () => {
  return currentAutomationLogs;
});

// Check if automation is running
ipcMain.handle('is-automation-running', () => {
  return automationRunning;
});

// Stop automation
ipcMain.handle('stop-automation', async () => {
  if (!stopAutomationFn) {
    return { success: false, message: 'Automation module not loaded' };
  }

  automationRunning = false;
  const result = await stopAutomationFn();
  return result;
});

/**
 * PROFILE UPDATE IPC HANDLERS
 * Runs Puppeteer profile update locally in Electron
 */
let profileUpdateRunning = false;
let currentProfileUpdateLogs = [];
let runProfileUpdate = null;
let stopProfileUpdateFn = null;
let profileUpdateModuleReady = false;

// Dynamically import profile update module (ES module)
async function loadProfileUpdateModule() {
  try {
    const profileUpdateModulePath = path.join(__dirname, 'automation', 'profileUpdateBot.mjs');
    const profileUpdateModuleUrl = `file://${profileUpdateModulePath.replace(/\\/g, '/')}`;

    debugLog(`Loading profile update module from: ${profileUpdateModuleUrl}`);
    debugLog(`Module path exists: ${fs.existsSync(profileUpdateModulePath)}`);

    const profileUpdateModule = await import(profileUpdateModuleUrl);

    runProfileUpdate = profileUpdateModule.runProfileUpdate;
    stopProfileUpdateFn = profileUpdateModule.stopProfileUpdate;

    profileUpdateModuleReady = true;

    debugLog('✅ Local profile update module loaded successfully');
    console.log('✅ Local profile update module loaded and ready');

    return true;
  } catch (error) {
    profileUpdateModuleReady = false;
    debugLog(`❌ Failed to load profile update module: ${error.message}`);
    console.error('❌ Failed to load profile update module:', error);
    return false;
  }
}

// Load profile update module after app is ready
app.whenReady().then(async () => {
  setTimeout(async () => {
    await loadProfileUpdateModule();
  }, 3000); // Load after automation module
});

// Start profile update locally
ipcMain.handle('start-profile-update', async (event, config) => {
  if (!runProfileUpdate || !profileUpdateModuleReady) {
    return {
      success: false,
      error: 'Profile update module not loaded yet. Please try again.'
    };
  }

  if (profileUpdateRunning) {
    return {
      success: false,
      error: 'Profile update already running'
    };
  }

  profileUpdateRunning = true;
  currentProfileUpdateLogs = [];

  try {
    console.log('🖥️  Starting LOCAL profile update');

    // Fetch credentials from AWS backend
    const API_BASE_URL = 'https://api.autojobzy.com/api';
    const token = config.token;

    if (!token) {
      throw new Error('No authentication token provided');
    }

    const fetch = (await import('node-fetch')).default;

    // Fetch job settings for credentials
    const settingsResponse = await fetch(`${API_BASE_URL}/job-settings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!settingsResponse.ok) {
      throw new Error('Failed to fetch job settings from server');
    }

    const settings = await settingsResponse.json();

    if (!settings.naukriEmail || !settings.naukriPassword) {
      throw new Error('Naukri credentials not found. Please add them in Job Profile settings.');
    }

    // Run profile update locally with visible browser
    const result = await runProfileUpdate({
      naukriEmail: settings.naukriEmail,
      naukriPassword: settings.naukriPassword
    }, (log) => {
      // Send logs to renderer in real-time
      currentProfileUpdateLogs.push(log);
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('profile-update-log', log);
      }
    });

    profileUpdateRunning = false;
    return result;

  } catch (error) {
    console.error('Profile update error:', error);
    profileUpdateRunning = false;
    return {
      success: false,
      error: error.message,
      logs: currentProfileUpdateLogs
    };
  }
});

// Check if profile update is running
ipcMain.handle('is-profile-update-running', () => {
  return profileUpdateRunning;
});

// Stop profile update
ipcMain.handle('stop-profile-update', async () => {
  if (!stopProfileUpdateFn) {
    return { success: false, message: 'Profile update module not loaded' };
  }

  profileUpdateRunning = false;
  const result = await stopProfileUpdateFn();
  return result;
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
