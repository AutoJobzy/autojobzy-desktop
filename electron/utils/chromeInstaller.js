/**
 * Production-grade Chrome auto-installer for Puppeteer
 * Checks and installs Chrome if missing on Windows/macOS
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Get expected Chrome executable path for current platform
 */
function getExpectedChromePath() {
    const platform = os.platform();
    const homeDir = os.homedir();

    if (platform === 'win32') {
        // Windows: Check both locations
        return [
            path.join(homeDir, '.cache', 'puppeteer', 'chrome', 'win64-*', 'chrome-win64', 'chrome.exe'),
            path.join(process.cwd(), 'node_modules', 'puppeteer', '.local-chromium', 'win64-*', 'chrome-win', 'chrome.exe')
        ];
    } else if (platform === 'darwin') {
        // macOS
        return [
            path.join(homeDir, '.cache', 'puppeteer', 'chrome', 'mac-*', 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
            path.join(homeDir, 'Library', 'Caches', 'ms-playwright', 'chromium-*', 'chrome-mac', 'Chromium.app'),
            path.join(process.cwd(), '.chrome-build', 'chrome', 'mac-*', 'chrome-mac', 'Chromium.app')
        ];
    } else {
        // Linux
        return [
            path.join(homeDir, '.cache', 'puppeteer', 'chrome', 'linux-*', 'chrome-linux64', 'chrome'),
            path.join(process.cwd(), 'node_modules', 'puppeteer', '.local-chromium', 'linux-*', 'chrome-linux', 'chrome')
        ];
    }
}

/**
 * Check if Chrome is installed by looking for executable
 */
function isChromeInstalled() {
    const possiblePaths = getExpectedChromePath();

    for (const pathPattern of possiblePaths) {
        try {
            // Handle wildcards in path by checking parent directory
            const dir = path.dirname(pathPattern.replace('*', ''));
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(path.dirname(dir));
                // If directory exists and has contents, Chrome is likely installed
                if (files.length > 0) {
                    console.log('✅ Chrome found at:', dir);
                    return true;
                }
            }
        } catch (err) {
            // Continue checking other paths
        }
    }

    return false;
}

/**
 * Install Chrome using puppeteer browsers install command
 * @param {Function} onProgress - Callback for progress updates (message, percent)
 */
async function installChrome(onProgress = null) {
    try {
        if (onProgress) onProgress('Starting Chrome download...', 0);

        console.log('📥 Installing Chrome for Puppeteer...');

        // Use npx to ensure we use the right puppeteer version
        const command = process.platform === 'win32'
            ? 'npx.cmd puppeteer browsers install chrome'
            : 'npx puppeteer browsers install chrome';

        if (onProgress) onProgress('Downloading Chrome...', 30);

        // Execute installation (this may take 1-3 minutes)
        execSync(command, {
            cwd: process.cwd(),
            stdio: 'inherit', // Show output in console
            env: {
                ...process.env,
                PUPPETEER_CACHE_DIR: path.join(process.cwd(), '.chrome-build') // Store in app directory
            }
        });

        if (onProgress) onProgress('Chrome installed successfully!', 100);
        console.log('✅ Chrome installed successfully!');

        return { success: true, message: 'Chrome installed' };

    } catch (error) {
        console.error('❌ Chrome installation failed:', error.message);
        if (onProgress) onProgress('Installation failed: ' + error.message, 0);

        return {
            success: false,
            error: error.message,
            message: 'Failed to install Chrome. Please install manually using: npx puppeteer browsers install chrome'
        };
    }
}

/**
 * Main function: Check and install Chrome if needed
 * Call this on app startup before any Puppeteer usage
 * @param {Function} onProgress - Optional progress callback
 */
export async function ensureChromeInstalled(onProgress = null) {
    console.log('🔍 Checking Chrome installation...');

    if (isChromeInstalled()) {
        console.log('✅ Chrome already installed');
        if (onProgress) onProgress('Chrome is ready', 100);
        return { success: true, alreadyInstalled: true };
    }

    console.log('⚠️  Chrome not found, installing...');
    if (onProgress) onProgress('Chrome not found, starting installation...', 10);

    // Install Chrome
    const result = await installChrome(onProgress);

    return result;
}

/**
 * Get Chrome installation status (for UI display)
 */
export function getChromeStatus() {
    const installed = isChromeInstalled();
    return {
        installed,
        message: installed ? 'Chrome is installed and ready' : 'Chrome needs to be installed'
    };
}
