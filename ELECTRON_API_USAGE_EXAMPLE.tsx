/**
 * Example: Using Electron API in React Components
 * This shows how to optionally detect Electron and use desktop features
 *
 * IMPORTANT: This is OPTIONAL - your existing React code works without changes
 * Only add this if you want desktop-specific features
 */

import { useEffect, useState } from 'react';

// Type-safe Electron API access
declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      isElectron: () => Promise<boolean>;
      getServerStatus: () => Promise<{ running: boolean; port: number }>;
      platform: string;
      arch: string;
    };
  }
}

/**
 * Example Component: App Header with Version Display
 */
export function AppHeader() {
  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    // Check if running in Electron
    if (window.electronAPI) {
      window.electronAPI.isElectron().then(setIsElectron);
      window.electronAPI.getAppVersion().then(setAppVersion);
    }
  }, []);

  return (
    <header>
      <h1>AutoJobzy</h1>
      {isElectron && (
        <div className="desktop-badge">
          Desktop App v{appVersion}
        </div>
      )}
    </header>
  );
}

/**
 * Example Component: Platform Info
 */
export function PlatformInfo() {
  const [platform, setPlatform] = useState<string>('web');

  useEffect(() => {
    if (window.electronAPI) {
      setPlatform(`${window.electronAPI.platform} (${window.electronAPI.arch})`);
    }
  }, []);

  return (
    <div className="platform-info">
      Running on: {platform}
    </div>
  );
}

/**
 * Example Hook: useElectron
 * Custom hook to easily access Electron features
 */
export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [version, setVersion] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<{
    running: boolean;
    port: number;
  } | null>(null);

  useEffect(() => {
    const checkElectron = async () => {
      if (window.electronAPI) {
        const isElectronApp = await window.electronAPI.isElectron();
        setIsElectron(isElectronApp);

        if (isElectronApp) {
          const ver = await window.electronAPI.getAppVersion();
          setVersion(ver);

          const status = await window.electronAPI.getServerStatus();
          setServerStatus(status);
        }
      }
    };

    checkElectron();
  }, []);

  return {
    isElectron,
    version,
    serverStatus,
    platform: window.electronAPI?.platform || 'web',
    arch: window.electronAPI?.arch || 'unknown',
  };
}

/**
 * Example Usage in Your App
 */
export function ExampleUsage() {
  const { isElectron, version, serverStatus } = useElectron();

  return (
    <div>
      {isElectron ? (
        <div>
          <p>Running in Desktop Mode</p>
          <p>Version: {version}</p>
          <p>Server: {serverStatus?.running ? 'Running' : 'Stopped'}</p>
          <p>Port: {serverStatus?.port}</p>
        </div>
      ) : (
        <div>
          <p>Running in Web Browser</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Conditional API Base URL
 * Automatically use localhost when in Electron, remote server when in web
 */
export function getAPIBaseURL(): string {
  // If in Electron, always use localhost
  if (window.electronAPI) {
    return 'https://api.autojobzy.com';
  }

  // Otherwise, use environment variable or default
  return import.meta.env.VITE_API_BASE_URL || 'https://your-production-server.com';
}

/**
 * Example: API Service with Electron Detection
 */
export class APIService {
  private baseURL: string;

  constructor() {
    this.baseURL = getAPIBaseURL();
  }

  async makeRequest(endpoint: string, options?: RequestInit) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Your existing API methods remain unchanged
  async login(email: string, password: string) {
    return this.makeRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  }

  async startAutomation(jobSettings: any) {
    return this.makeRequest('/api/automation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobSettings),
    });
  }
}

/**
 * HOW TO USE IN YOUR EXISTING APP:
 *
 * 1. NO CHANGES REQUIRED - Your existing code works as-is
 *
 * 2. OPTIONAL: Add Electron detection for desktop-specific features
 *    - Import and use the useElectron() hook
 *    - Check window.electronAPI existence before using
 *
 * 3. OPTIONAL: Update API base URL logic
 *    - Use getAPIBaseURL() instead of hardcoded URLs
 *    - This automatically switches between local and remote
 *
 * 4. Your existing components, pages, and logic remain UNCHANGED
 */
