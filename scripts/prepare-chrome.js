#!/usr/bin/env node

/**
 * ======================== PREPARE CHROME FOR BUILD ========================
 * Downloads Chrome to a local directory before electron-builder runs
 * This ensures Chrome is bundled with the app
 * ==========================================================================
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const chromeBuildDir = path.join(projectRoot, '.chrome-build');

console.log('\n════════════════════════════════════════════════════');
console.log('  PREPARING CHROME FOR APP BUILD');
console.log('════════════════════════════════════════════════════\n');

/**
 * Ensure Chrome build directory exists
 */
function ensureChromeBuildDir() {
    if (!fs.existsSync(chromeBuildDir)) {
        console.log(`📁 Creating Chrome build directory: ${chromeBuildDir}`);
        fs.mkdirSync(chromeBuildDir, { recursive: true });
    }
}

/**
 * Download Chrome to local build directory
 */
function downloadChrome() {
    try {
        console.log('📦 Downloading Chrome for Puppeteer...');
        console.log('   This ensures Chrome is bundled with the app.\n');

        // Set environment variable to use custom cache directory
        const env = {
            ...process.env,
            PUPPETEER_CACHE_DIR: chromeBuildDir
        };

        // Install Chrome to custom directory
        execSync('npx puppeteer browsers install chrome', {
            stdio: 'inherit',
            timeout: 5 * 60 * 1000, // 5 minutes
            env
        });

        console.log('\n✅ Chrome downloaded successfully!');
        console.log(`📁 Location: ${chromeBuildDir}`);

        // Verify download
        const chromeDir = path.join(chromeBuildDir, 'chrome');
        if (fs.existsSync(chromeDir)) {
            const files = fs.readdirSync(chromeDir);
            console.log(`✅ Chrome versions found: ${files.length}`);
            files.forEach(file => {
                console.log(`   - ${file}`);
            });
        }

        return true;
    } catch (error) {
        console.error('\n❌ Failed to download Chrome:', error.message);
        console.log('\n⚠️  Build will continue, but Puppeteer may not work without Chrome.');
        return false;
    }
}

/**
 * Create a marker file to indicate Chrome is bundled
 */
function createMarkerFile() {
    const markerFile = path.join(chromeBuildDir, 'CHROME_BUNDLED');
    fs.writeFileSync(markerFile, JSON.stringify({
        bundled: true,
        date: new Date().toISOString(),
        note: 'Chrome is bundled with this app build'
    }, null, 2));
    console.log('✅ Created bundle marker file');
}

/**
 * Main function
 */
async function main() {
    ensureChromeBuildDir();
    const success = downloadChrome();

    if (success) {
        createMarkerFile();
        console.log('\n✅ Chrome is ready for app packaging!');
    } else {
        console.log('\n⚠️  Chrome preparation completed with warnings.');
    }

    console.log('════════════════════════════════════════════════════\n');
}

// Run
main().catch(error => {
    console.error('\n❌ Preparation failed:', error.message);
    process.exit(0); // Don't fail the build
});
