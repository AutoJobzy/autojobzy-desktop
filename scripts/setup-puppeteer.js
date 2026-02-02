#!/usr/bin/env node

/**
 * ======================== PUPPETEER CHROME SETUP ========================
 * Automatically installs Chrome for Puppeteer during app installation
 * Runs as postinstall script to ensure Chrome is available for automation
 * =========================================================================
 */

import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const platform = os.platform();
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

console.log('\n🔍 Checking Puppeteer Chrome installation...');
console.log(`Platform: ${platform}`);

/**
 * Check if Chrome is already installed for Puppeteer
 */
function isChromeInstalled() {
    try {
        const output = execSync('npx puppeteer browsers list', {
            encoding: 'utf8',
            stdio: 'pipe'
        });

        // Check if chrome is in the list
        if (output.includes('chrome@')) {
            console.log('✅ Chrome is already installed for Puppeteer');
            return true;
        }
    } catch (error) {
        console.log('⚠️  Could not check Chrome installation status');
    }
    return false;
}

/**
 * Get Puppeteer cache directory
 */
function getPuppeteerCacheDir() {
    const homeDir = os.homedir();
    return path.join(homeDir, '.cache', 'puppeteer');
}

/**
 * Install Chrome for Puppeteer
 */
async function installChrome() {
    console.log('\n📦 Installing Chrome for Puppeteer...');
    console.log('This may take a few minutes on first install.');

    try {
        // Install Chrome using Puppeteer
        execSync('npx puppeteer browsers install chrome', {
            stdio: 'inherit',
            timeout: 5 * 60 * 1000 // 5 minutes timeout
        });

        console.log('\n✅ Chrome installed successfully!');

        // Verify installation
        const cacheDir = getPuppeteerCacheDir();
        if (fs.existsSync(cacheDir)) {
            console.log(`📁 Chrome cache location: ${cacheDir}`);
        }

        return true;
    } catch (error) {
        console.error('\n❌ Failed to install Chrome:', error.message);

        // Provide platform-specific troubleshooting
        console.log('\n🔧 Troubleshooting:');

        if (isWindows) {
            console.log('  - Ensure you have internet connection');
            console.log('  - Try running as Administrator');
            console.log('  - Check if antivirus is blocking the download');
        } else if (isMac) {
            console.log('  - Ensure you have internet connection');
            console.log('  - Check your ~/. cache/puppeteer directory permissions');
        } else if (isLinux) {
            console.log('  - Install dependencies: sudo apt-get install -y libgbm1 libnss3 libatk-bridge2.0-0');
            console.log('  - Ensure you have internet connection');
        }

        return false;
    }
}

/**
 * Main setup function
 */
async function main() {
    console.log('\n════════════════════════════════════════════════════');
    console.log('  AUTOJOBZY - PUPPETEER CHROME SETUP');
    console.log('════════════════════════════════════════════════════\n');

    // Check if already installed
    if (isChromeInstalled()) {
        console.log('✅ Chrome is ready for automation!');
        console.log('════════════════════════════════════════════════════\n');
        return;
    }

    // Install Chrome
    console.log('⚠️  Chrome not found. Installing...');
    const success = await installChrome();

    if (success) {
        console.log('\n✅ Setup completed successfully!');
        console.log('   Naukri credential verification is now ready to use.');
    } else {
        console.log('\n⚠️  Setup completed with warnings.');
        console.log('   You may need to manually install Chrome for Puppeteer.');
        console.log('   Run: npx puppeteer browsers install chrome');
    }

    console.log('════════════════════════════════════════════════════\n');
}

// Run setup
main().catch(error => {
    console.error('\n❌ Setup failed:', error.message);
    // Don't fail the installation, just warn
    process.exit(0);
});
