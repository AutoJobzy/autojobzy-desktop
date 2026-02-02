/**
 * ======================== PUPPETEER HELPER ========================
 * Shared utility for launching Puppeteer with Chrome detection
 * Handles Chrome installation and fallback to system Chrome
 * ==================================================================
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
 * Find system Chrome executable
 */
function findSystemChrome() {
    const platform = process.platform;
    const possiblePaths = [];

    if (platform === 'win32') {
        possiblePaths.push(
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
            path.join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe')
        );
    } else if (platform === 'darwin') {
        possiblePaths.push(
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            path.join(process.env.HOME || '', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        );
    } else if (platform === 'linux') {
        possiblePaths.push(
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/snap/bin/chromium'
        );
    }

    for (const chromePath of possiblePaths) {
        if (fs.existsSync(chromePath)) {
            console.log('[PUPPETEER] ✓ Found system Chrome at:', chromePath);
            return chromePath;
        }
    }

    return null;
}

/**
 * Check if Puppeteer's Chrome is installed
 */
async function checkPuppeteerChrome() {
    try {
        const executablePath = puppeteer.executablePath();
        if (executablePath && fs.existsSync(executablePath)) {
            console.log('[PUPPETEER] ✓ Puppeteer Chrome found at:', executablePath);
            return executablePath;
        }
    } catch (error) {
        console.log('[PUPPETEER] Puppeteer Chrome not found');
    }
    return null;
}

/**
 * Try to install Puppeteer Chrome
 */
async function installPuppeteerChrome() {
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
 * Ensure Chrome is available (check once per session)
 */
async function ensureChromeAvailable() {
    if (chromeCheckCompleted) {
        return { available: chromeAvailable, executablePath: chromeExecutablePath };
    }

    console.log('[PUPPETEER] Checking for Chrome installation...');

    // 1. Check if Puppeteer's Chrome is installed
    let execPath = await checkPuppeteerChrome();

    // 2. If not, try to install it
    if (!execPath) {
        console.log('[PUPPETEER] Puppeteer Chrome not found, trying to install...');
        execPath = await installPuppeteerChrome();
    }

    // 3. If installation failed, try to use system Chrome
    if (!execPath) {
        console.log('[PUPPETEER] Installation failed, looking for system Chrome...');
        execPath = findSystemChrome();
    }

    chromeCheckCompleted = true;
    chromeAvailable = !!execPath;
    chromeExecutablePath = execPath;

    if (chromeAvailable) {
        console.log('[PUPPETEER] ✓ Chrome is available');
    } else {
        console.error('[PUPPETEER] ✗ Chrome not found on system');
    }

    return { available: chromeAvailable, executablePath: chromeExecutablePath };
}

/**
 * Launch browser with automatic Chrome detection and fallback
 * @param {Object} options - Additional Puppeteer launch options
 * @returns {Promise<Browser>}
 */
export async function launchBrowser(options = {}) {
    // Ensure Chrome is available
    const { available, executablePath } = await ensureChromeAvailable();

    if (!available) {
        throw new Error(
            'Chrome browser not found. Please install Google Chrome from https://www.google.com/chrome/ and restart the application.'
        );
    }

    // Default browser configuration
    const browserConfig = {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled',
            '--disable-gpu',
            '--window-size=1920,1080',
        ],
        defaultViewport: null,
        timeout: 60000, // 60 second timeout for launch
        ...options
    };

    // Use found Chrome executable
    if (executablePath) {
        browserConfig.executablePath = executablePath;
    }

    console.log('[PUPPETEER] Launching browser...');

    try {
        const browser = await puppeteer.launch(browserConfig);
        console.log('[PUPPETEER] ✓ Browser launched successfully');
        return browser;
    } catch (error) {
        console.error('[PUPPETEER] Failed to launch browser:', error.message);
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
