/**
 * Electron Preload Script
 * Bridges Electron main process with renderer (React)
 * Exposes minimal API for desktop-specific features
 */

const { contextBridge, ipcRenderer } = require('electron');

console.log('🚀 [Preload] Starting preload script...');
console.log('🚀 [Preload] Platform:', process.platform);
console.log('🚀 [Preload] Arch:', process.arch);
console.log('🚀 [Preload] Node version:', process.version);

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Get app version
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Check if running in Electron
  isElectron: () => ipcRenderer.invoke('is-electron'),

  // Get server status
  getServerStatus: () => ipcRenderer.invoke('get-server-status'),

  // Platform info
  platform: process.platform,
  arch: process.arch,

  // ===== LOCAL AUTOMATION APIs =====
  // Check if automation module is ready
  isAutomationModuleReady: () => ipcRenderer.invoke('is-automation-module-ready'),

  // Retry loading automation module
  retryLoadAutomationModule: () => ipcRenderer.invoke('retry-load-automation-module'),

  // Start automation locally
  startAutomation: (config) => ipcRenderer.invoke('start-automation', config),

  // Get automation logs
  getAutomationLogs: () => ipcRenderer.invoke('get-automation-logs'),

  // Check if automation is running
  isAutomationRunning: () => ipcRenderer.invoke('is-automation-running'),

  // Stop automation
  stopAutomation: () => ipcRenderer.invoke('stop-automation'),

  // Listen for real-time automation logs
  onAutomationLog: (callback) => {
    const subscription = (event, log) => callback(log);
    ipcRenderer.on('automation-log', subscription);
    return subscription;
  },

  // Remove automation log listener
  removeAutomationLogListener: (callback) => {
    if (callback) {
      ipcRenderer.removeListener('automation-log', callback);
    } else {
      ipcRenderer.removeAllListeners('automation-log');
    }
  },

  // Listen for automation module ready event
  onAutomationModuleReady: (callback) => {
    const subscription = () => callback();
    ipcRenderer.on('automation-module-ready', subscription);
    return subscription;
  },

  // Listen for automation module error event
  onAutomationModuleError: (callback) => {
    const subscription = (event, error) => callback(error);
    ipcRenderer.on('automation-module-error', subscription);
    return subscription;
  }
});

console.log('✅ [Preload] Electron preload script loaded successfully');
console.log('✅ [Preload] electronAPI exposed to window object');
console.log('✅ [Preload] Available methods:', Object.keys({
  getAppVersion: true,
  isElectron: true,
  getServerStatus: true,
  platform: true,
  arch: true,
  startAutomation: true,
  getAutomationLogs: true,
  isAutomationRunning: true,
  stopAutomation: true,
  onAutomationLog: true,
  removeAutomationLogListener: true
}));
