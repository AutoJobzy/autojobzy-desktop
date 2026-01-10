/**
 * Type definitions for Electron API exposed to renderer
 * Allows TypeScript to recognize window.electronAPI
 */

interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  isElectron: () => Promise<boolean>;
  getServerStatus: () => Promise<{
    running: boolean;
    port: number;
  }>;
  platform: string;
  arch: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
