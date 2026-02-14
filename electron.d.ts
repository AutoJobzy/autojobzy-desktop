/**
 * Type definitions for Electron API exposed to renderer
 * Allows TypeScript to recognize window.electronAPI
 */

interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  isElectron: () => Promise<boolean>;
  getServerStatus: () => Promise<{
    running: boolean;
    remote: boolean;
    url: string;
    message: string;
  }>;
  platform: string;
  arch: string;

  // Automation APIs
  isAutomationModuleReady: () => Promise<{ ready: boolean; error: string | null }>;
  retryLoadAutomationModule: () => Promise<boolean>;
  startAutomation: (config: any) => Promise<any>;
  getAutomationLogs: () => Promise<any[]>;
  isAutomationRunning: () => Promise<boolean>;
  stopAutomation: () => Promise<any>;
  onAutomationLog: (callback: (log: any) => void) => any;
  removeAutomationLogListener: (callback?: any) => void;
  onAutomationModuleReady: (callback: () => void) => any;
  onAutomationModuleError: (callback: (error: string) => void) => any;

  // Profile Update APIs
  startProfileUpdate: (config: { token: string }) => Promise<any>;
  isProfileUpdateRunning: () => Promise<boolean>;
  stopProfileUpdate: () => Promise<any>;
  onProfileUpdateLog: (callback: (log: any) => void) => any;
  removeProfileUpdateLogListener: (callback?: any) => void;

  // Chrome Installer APIs
  getChromeStatus: () => Promise<{ installed: boolean; message: string }>;
  installChrome: () => Promise<{ success: boolean; error?: string; alreadyInstalled?: boolean }>;
  onChromeInstallProgress: (callback: (progress: { message: string; percent: number }) => void) => () => void;
  startRecommendedJobsAutomation: (config: any) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    electron: ElectronAPI; // Alias for convenience
  }
}

export {};
