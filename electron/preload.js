/**
 * Electron Preload Script
 * Bridges Electron main process with renderer (React)
 * Exposes minimal API for desktop-specific features
 */

const { contextBridge, ipcRenderer } = require('electron');

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
});

console.log('✅ Electron preload script loaded');
