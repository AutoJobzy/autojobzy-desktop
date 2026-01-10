/**
 * Pre-build script to prepare environment for production build
 * Copies .env.production to .env for the build
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const envProdPath = path.join(rootDir, '.env.production');
const envPath = path.join(rootDir, '.env.electron');

console.log('📦 Preparing production build...');

// Check if .env.production exists
if (fs.existsSync(envProdPath)) {
  console.log('✅ Found .env.production');

  // Copy to .env.electron (used in build)
  fs.copyFileSync(envProdPath, envPath);
  console.log('✅ Copied to .env.electron for build');
} else {
  console.log('⚠️  .env.production not found, using existing .env');
}

console.log('✅ Build preparation complete');
