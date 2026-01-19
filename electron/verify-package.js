/**
 * Package Verification Script
 * Run this in the packaged app to verify all backend files are present
 * Windows मध्ये backend files packaged आहेत का verify करण्यासाठी
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

function isDev() {
  return !app.isPackaged;
}

function verifyPackage() {
  const results = {
    mode: isDev() ? 'Development' : 'Production',
    timestamp: new Date().toISOString(),
    checks: [],
    errors: [],
    warnings: [],
  };

  console.log('\n=== 📦 PACKAGE VERIFICATION ===\n');
  console.log(`Mode: ${results.mode}`);
  console.log(`app.isPackaged: ${app.isPackaged}`);
  console.log(`__dirname: ${__dirname}`);
  console.log(`process.resourcesPath: ${process.resourcesPath}`);
  console.log(`app.getAppPath(): ${app.getAppPath()}`);
  console.log(`process.cwd(): ${process.cwd()}`);
  console.log(`process.execPath: ${process.execPath}\n`);

  // Define all critical paths to check
  const pathsToCheck = [
    // Server files
    { type: 'server', path: 'server/index.js' },
    { type: 'server', path: 'server/package.json' },
    { type: 'server', path: 'server/db' }, // db is a directory
    { type: 'server', path: 'server/routes' }, // routes is a directory

    // Environment files
    { type: 'env', path: '.env.production' },

    // Electron files
    { type: 'electron', path: 'electron/main.js' },
    { type: 'electron', path: 'electron/preload.js' },
    { type: 'electron', path: 'electron/server.js' },

    // Utils
    { type: 'utils', path: 'utils/config.ts' },

    // Frontend dist
    { type: 'frontend', path: 'dist/index.html' },
  ];

  // Check each path in multiple locations
  pathsToCheck.forEach(({ type, path: relativePath }) => {
    const check = {
      type,
      file: relativePath,
      locations: [],
      found: false,
    };

    // Possible locations based on packaging
    const searchPaths = isDev()
      ? [
          path.join(__dirname, '..', relativePath),
        ]
      : [
          // Production - check multiple locations
          path.join(process.resourcesPath, relativePath),
          path.join(process.resourcesPath, 'app.asar.unpacked', relativePath),
          path.join(__dirname, '..', relativePath),
          path.join(app.getAppPath(), relativePath),
        ];

    searchPaths.forEach((fullPath) => {
      const exists = fs.existsSync(fullPath);
      check.locations.push({
        path: fullPath,
        exists,
        ...(exists && { size: fs.statSync(fullPath).size }),
      });
      if (exists) {
        check.found = true;
      }
    });

    results.checks.push(check);

    // Log results
    if (check.found) {
      console.log(`✅ ${check.file}`);
      check.locations.forEach((loc) => {
        if (loc.exists) {
          console.log(`   Found: ${loc.path} (${loc.size} bytes)`);
        }
      });
    } else {
      console.log(`❌ ${check.file} - NOT FOUND`);
      results.errors.push(`Missing: ${check.file}`);
      check.locations.forEach((loc) => {
        console.log(`   ✗ ${loc.path}`);
      });
    }
  });

  // Check node_modules (critical for backend)
  console.log('\n=== 📚 NODE_MODULES CHECK ===\n');
  const nodeModulesPaths = isDev()
    ? [path.join(__dirname, '..', 'node_modules')]
    : [
        path.join(process.resourcesPath, 'node_modules'),
        path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules'),
      ];

  nodeModulesPaths.forEach((nmPath) => {
    const exists = fs.existsSync(nmPath);
    console.log(`${exists ? '✅' : '❌'} ${nmPath}`);
    if (exists) {
      // Check for critical modules
      const criticalModules = ['express', 'mysql2', 'puppeteer', 'dotenv'];
      criticalModules.forEach((mod) => {
        const modPath = path.join(nmPath, mod);
        const modExists = fs.existsSync(modPath);
        console.log(`   ${modExists ? '✓' : '✗'} ${mod}`);
        if (!modExists) {
          results.warnings.push(`Missing module: ${mod}`);
        }
      });
    }
  });

  // Check Puppeteer Chromium
  console.log('\n=== 🌐 PUPPETEER CHROMIUM CHECK ===\n');
  const chromiumPaths = isDev()
    ? [path.join(__dirname, '..', 'node_modules', 'puppeteer', '.local-chromium')]
    : [
        path.join(process.resourcesPath, '.local-chromium'),
        path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'puppeteer', '.local-chromium'),
      ];

  chromiumPaths.forEach((chromiumPath) => {
    const exists = fs.existsSync(chromiumPath);
    console.log(`${exists ? '✅' : '❌'} ${chromiumPath}`);
    if (exists) {
      try {
        const files = fs.readdirSync(chromiumPath);
        console.log(`   Found ${files.length} items`);
      } catch (e) {
        console.log(`   Error reading directory: ${e.message}`);
      }
    }
  });

  // Summary
  console.log('\n=== 📊 SUMMARY ===\n');
  const totalChecks = results.checks.length;
  const foundChecks = results.checks.filter((c) => c.found).length;
  console.log(`Total files checked: ${totalChecks}`);
  console.log(`Files found: ${foundChecks}`);
  console.log(`Files missing: ${totalChecks - foundChecks}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`Warnings: ${results.warnings.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach((err) => console.log(`   - ${err}`));
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach((warn) => console.log(`   - ${warn}`));
  }

  // Write results to file
  const logPath = path.join(
    require('os').tmpdir(),
    'autojobzy-package-verification.json'
  );
  try {
    fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Full results written to: ${logPath}`);
  } catch (e) {
    console.log(`\n⚠️  Could not write log file: ${e.message}`);
  }

  console.log('\n=================================\n');

  return {
    success: results.errors.length === 0,
    results,
  };
}

module.exports = { verifyPackage };
