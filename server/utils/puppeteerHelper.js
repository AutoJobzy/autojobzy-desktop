/**
 * ======================== PRODUCTION-SAFE PUPPETEER HELPER ========================
 * Bundled Chrome detection for Electron production builds
 * NO system Chrome fallback, NO runtime installs
 * ==================================================================================
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let chromeCheckCompleted = false;
let chromeAvailable = false;
let chromeExecutablePath = null;

/**
 * Find bundled Chrome in production app (extraResources)
 * Production - AutoJobzy/resources/.puppeteer-browsers/chrome/win64-star/chrome.exe
 * Dev - Uses Puppeteer default Chrome location
 */
function findBundledChrome() {
    const platform = process.platform;
    const isPackaged = process.resourcesPath && !process.resourcesPath.includes('node_modules');

    if (isPackaged) {
        // PRODUCTION: Check bundled Chrome in resources
        console.log('[PUPPETEER] Running in PRODUCTION mode');
        const resourcesPath = process.resourcesPath;
        const chromeBrowsersPath = path.join(resourcesPath, '.puppeteer-browsers', 'chrome');

        console.log('[PUPPETEER] Searching for bundled Chrome in:', chromeBrowsersPath);

        if (fs.existsSync(chromeBrowsersPath)) {
            try {
                // Find Chrome version directory (win64-*, mac-*, linux-*)
                const versionDirs = fs.readdirSync(chromeBrowsersPath).filter(dir => {
                    return dir.startsWith('win64-') || dir.startsWith('mac-') || dir.startsWith('linux-');
                });

                if (versionDirs.length > 0) {
                    const latestVersion = versionDirs.sort().pop();
                    let chromePath;

                    if (platform === 'win32') {
                        chromePath = path.join(chromeBrowsersPath, latestVersion, 'chrome-win64', 'chrome.exe');
                    } else if (platform === 'darwin') {
                        chromePath = path.join(chromeBrowsersPath, latestVersion, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium');
                    } else {
                        chromePath = path.join(chromeBrowsersPath, latestVersion, 'chrome-linux', 'chrome');
                    }

                    if (fs.existsSync(chromePath)) {
                        console.log('[PUPPETEER] ✓ Found bundled Chrome:', chromePath);
                        return chromePath;
                    }
                }
            } catch (error) {
                console.error('[PUPPETEER] Error searching for Chrome:', error.message);
            }
        }

        console.error('[PUPPETEER] ✗ Bundled Chrome not found in:', resourcesPath);
        console.error('[PUPPETEER] Build must include Chrome. Run: npx puppeteer browsers install chrome');
        return null;
    }

    // DEV: Let Puppeteer use its default Chrome
    console.log('[PUPPETEER] Running in DEV mode');
    return null;
}

/**
 * Check Puppeteer's default Chrome (dev mode only)
 */
async function checkPuppeteerChrome() {
    try {
        const executablePath = puppeteer.executablePath();
        if (executablePath && fs.existsSync(executablePath)) {
            // REJECT Program Files Chrome on Windows (permission issues)
            if (process.platform === 'win32' && executablePath.includes('Program Files')) {
                console.log('[PUPPETEER] ⚠️ Found Program Files Chrome (permission issues) - rejecting');
                return null;
            }
            console.log('[PUPPETEER] ✓ Puppeteer Chrome:', executablePath);
            return executablePath;
        }
    } catch (error) {
        console.log('[PUPPETEER] Puppeteer Chrome not found');
    }
    return null;
}

/**
 * Try to install Puppeteer Chrome (dev mode only)
 */
async function installPuppeteerChrome() {
    // Skip auto-install in production
    const isPackaged = process.resourcesPath && !process.resourcesPath.includes('node_modules');
    if (isPackaged) {
        console.log('[PUPPETEER] Skipping auto-install in production mode');
        return null;
    }

    try {
        console.log('[PUPPETEER] Attempting to install Chrome...');
        console.log('[PUPPETEER] This may take 1-2 minutes...');

        const projectRoot = path.join(__dirname, '..', '..');

        execSync('npx puppeteer browsers install chrome', {
            cwd: projectRoot,
            stdio: 'inherit',
            timeout: 5 * 60 * 1000 // 5 minutes
        });

        console.log('[PUPPETEER] ✓ Chrome installed successfully');

        // Verify installation
        const executablePath = await checkPuppeteerChrome();
        return executablePath;
    } catch (error) {
        console.error('[PUPPETEER] Failed to install Chrome:', error.message);
        return null;
    }
}

/**
 * Ensure Chrome is available (bundled in production, installed in dev)
 * NO system Chrome fallback
 */
export async function ensureChromeAvailable() {
    if (chromeCheckCompleted) {
        return { available: chromeAvailable, executablePath: chromeExecutablePath };
    }

    console.log('[PUPPETEER] Checking for Chrome...');

    // 1. Check bundled Chrome (production) or Puppeteer Chrome (dev)
    let execPath = findBundledChrome();

    // 2. If dev mode and not found, check Puppeteer's default location
    if (!execPath) {
        execPath = await checkPuppeteerChrome();
    }

    // 3. If dev mode and still not found, try to auto-install
    if (!execPath) {
        console.log('[PUPPETEER] Chrome not found, trying to install...');
        execPath = await installPuppeteerChrome();
    }

    chromeCheckCompleted = true;
    chromeAvailable = !!execPath;
    chromeExecutablePath = execPath;

    if (chromeAvailable) {
        console.log('[PUPPETEER] ✓ Chrome ready');
    } else {
        console.error('[PUPPETEER] ✗ Chrome not found - app cannot run automation');
    }

    return { available: chromeAvailable, executablePath: chromeExecutablePath };
}

/**
 * Launch browser with production-safe config
 */
export async function launchBrowser(options = {}) {
    const { available, executablePath } = await ensureChromeAvailable();

    if (!available) {
        const isPackaged = process.resourcesPath && !process.resourcesPath.includes('node_modules');
        let errorMessage = 'Chrome browser not found.\n\n';

        if (isPackaged) {
            // Production error
            errorMessage += 'This app requires Chrome to be bundled at build time.\n';
            errorMessage += 'Please contact the developer.';
        } else {
            // Dev error
            errorMessage += 'For developers: Run "npx puppeteer browsers install chrome" before starting the app.';
        }

        throw new Error(errorMessage);
    }

    // Production-safe browser config (Windows-optimized)
    const browserConfig = {
        headless: 'new',
        executablePath, // Use bundled or dev Chrome
        args: [
            '--no-sandbox',                                    // Required for Windows
            '--disable-setuid-sandbox',                        // Permission bypass
            '--disable-dev-shm-usage',                         // Avoid /dev/shm issues
            '--disable-gpu',                                   // Windows stability
            '--disable-web-security',                          // Avoid CORS in automation
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled',  // Hide automation
            '--window-size=1920,1080',
        ],
        defaultViewport: null,
        timeout: 60000,
        ignoreHTTPSErrors: true,
        ...options // Allow overrides
    };

    console.log('[PUPPETEER] Launching browser...');

    try {
        const browser = await puppeteer.launch(browserConfig);
        console.log('[PUPPETEER] ✓ Browser launched successfully');
        return browser;
    } catch (error) {
        console.error('[PUPPETEER] Launch failed:', error.message);
        throw new Error(`Failed to launch Chrome: ${error.message}`);
    }
}

/**
 * Reset Chrome check (useful for testing)
 */
export function resetChromeCheck() {
    chromeCheckCompleted = false;
    chromeAvailable = false;
    chromeExecutablePath = null;
}
