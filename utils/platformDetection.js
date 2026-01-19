/**
 * Platform Detection Utilities
 * Helps detect Windows environment and adjust behavior accordingly
 */

// Flag to track if we've logged Electron API status
let electronAPIChecked = false;

/**
 * Check and log Electron API availability
 * Safe to call multiple times - only logs once
 */
function checkElectronAPI() {
  if (electronAPIChecked) return;
  electronAPIChecked = true;

  if (typeof window === 'undefined') return;

  console.log('🔍 [Platform] Checking Electron API...');
  console.log('🔍 [Platform] window.electronAPI exists:', typeof window.electronAPI !== 'undefined');
  if (window.electronAPI) {
    console.log('✅ [Platform] Electron API available');
    console.log('✅ [Platform] Platform:', window.electronAPI.platform);
    console.log('✅ [Platform] Arch:', window.electronAPI.arch);
  } else {
    console.warn('⚠️ [Platform] Electron API NOT available - preload may not have loaded!');
    console.warn('⚠️ [Platform] This will cause issues on Windows!');
  }
}

// Wait for DOM and preload to be ready before checking
if (typeof window !== 'undefined') {
  // Check after DOM is ready (ensures preload.js has executed)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkElectronAPI);
  } else {
    // DOM already loaded, check immediately
    checkElectronAPI();
  }
}

/**
 * Check if running on Windows
 * @returns {boolean} - True if running on Windows (Electron or browser)
 */
export function isWindows() {
  // Ensure we've checked Electron API availability
  if (typeof window !== 'undefined' && !electronAPIChecked) {
    checkElectronAPI();
  }

  // Check Electron API first (most reliable in desktop app)
  if (typeof window !== 'undefined' && window.electronAPI?.platform) {
    return window.electronAPI.platform === 'win32';
  }

  // Fallback to browser detection
  if (typeof navigator !== 'undefined') {
    return navigator.platform.toLowerCase().includes('win');
  }

  return false;
}

/**
 * Check if running on Mac
 * @returns {boolean} - True if running on Mac
 */
export function isMac() {
  // Ensure we've checked Electron API availability
  if (typeof window !== 'undefined' && !electronAPIChecked) {
    checkElectronAPI();
  }

  if (typeof window !== 'undefined' && window.electronAPI?.platform) {
    return window.electronAPI.platform === 'darwin';
  }

  if (typeof navigator !== 'undefined') {
    return navigator.platform.toLowerCase().includes('mac');
  }

  return false;
}

/**
 * Check if running in Electron
 * @returns {boolean} - True if running in Electron app
 */
export function isElectron() {
  // Ensure we've checked Electron API availability
  if (typeof window !== 'undefined' && !electronAPIChecked) {
    checkElectronAPI();
  }

  return typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined';
}

/**
 * Get platform-specific timeout
 * Windows needs longer timeouts due to network stack differences
 * @param {number} defaultTimeout - Default timeout in ms (default: 30000)
 * @returns {number} - Adjusted timeout for platform
 */
export function getTimeoutForPlatform(defaultTimeout = 30000) {
  // Windows needs 50% longer timeout
  return isWindows() ? Math.floor(defaultTimeout * 1.5) : defaultTimeout;
}

/**
 * Debug logging for Windows
 * Only logs on Windows platform to reduce noise
 * @param {string} message - Log message
 * @param {any} data - Optional data to log
 */
export function debugLog(message, data = null) {
  if (isWindows()) {
    const timestamp = new Date().toISOString();
    if (data !== null) {
      console.log(`[${timestamp}] [WINDOWS DEBUG] ${message}`, data);
    } else {
      console.log(`[${timestamp}] [WINDOWS DEBUG] ${message}`);
    }
  }
}

/**
 * Get platform-specific error message
 * @param {Error} error - Original error
 * @param {string} context - Context of the error (e.g., "login", "file upload")
 * @returns {string} - User-friendly error message
 */
export function getPlatformSpecificError(error, context = '') {
  let message = error.message || 'Unknown error';

  // Timeout errors
  if (message.includes('timeout')) {
    if (isWindows()) {
      return `${context ? context + ': ' : ''}Request timeout. On Windows, check your firewall settings and ensure the server is running.`;
    }
    return `${context ? context + ': ' : ''}Request timeout. Please check your internet connection.`;
  }

  // Network errors
  if (message.includes('Network error') || message.includes('Failed to fetch')) {
    if (isWindows()) {
      return `${context ? context + ': ' : ''}Cannot connect to server. Ensure the backend is running and Windows Firewall is not blocking the connection.`;
    }
    return `${context ? context + ': ' : ''}Cannot connect to server. Please ensure the backend is running.`;
  }

  // File path errors (Windows backslashes)
  if (message.includes('path') || message.includes('file')) {
    if (isWindows()) {
      return `${context ? context + ': ' : ''}File error. Windows path issue detected: ${message}`;
    }
  }

  // Default message with platform info
  return `${context ? context + ': ' : ''}${message}${isWindows() ? ' (Windows)' : ''}`;
}

/**
 * Get platform info for debugging
 * @returns {object} - Platform information
 */
export function getPlatformInfo() {
  return {
    isWindows: isWindows(),
    isMac: isMac(),
    isElectron: isElectron(),
    platform: window.electronAPI?.platform || navigator.platform,
    userAgent: navigator.userAgent
  };
}
