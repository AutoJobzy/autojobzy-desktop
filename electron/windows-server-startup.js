/**
 * Windows Server Startup Helper
 * Ensures all prerequisites are met before starting the server
 */

const fs = require('fs');
const path = require('path');

function checkWindowsPrerequisites(workingDir, serverPath) {
  console.log('\n========== Windows Server Startup Check ==========\n');

  const checks = [];
  let allPassed = true;

  // Check 1: Server file exists
  const serverExists = fs.existsSync(serverPath);
  checks.push({
    name: 'Server file exists',
    passed: serverExists,
    path: serverPath
  });
  if (!serverExists) allPassed = false;

  // Check 2: Working directory exists
  const workingDirExists = fs.existsSync(workingDir);
  checks.push({
    name: 'Working directory exists',
    passed: workingDirExists,
    path: workingDir
  });
  if (!workingDirExists) allPassed = false;

  // Check 3: package.json with type: module exists
  const serverDir = path.dirname(serverPath);
  const packageJsonPath = path.join(serverDir, 'package.json');
  const packageJsonExists = fs.existsSync(packageJsonPath);
  let hasModuleType = false;

  if (packageJsonExists) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      hasModuleType = packageJson.type === 'module';
    } catch (err) {
      // Invalid JSON
    }
  }

  checks.push({
    name: 'server/package.json with type: module',
    passed: packageJsonExists && hasModuleType,
    path: packageJsonPath,
    detail: hasModuleType ? 'type: module ✓' : 'type: module MISSING'
  });

  if (!hasModuleType) {
    allPassed = false;
    // Try to create it
    try {
      fs.writeFileSync(packageJsonPath, JSON.stringify({ type: 'module' }, null, 2));
      console.log('✓ Created server/package.json with type: module');
      checks[checks.length - 1].passed = true;
      allPassed = true;
    } catch (err) {
      console.error('✗ Failed to create package.json:', err.message);
    }
  }

  // Check 4: .env or .env.production exists
  const envPath = path.join(workingDir, '.env');
  const envProductionPath = path.join(workingDir, '.env.production');
  const hasEnv = fs.existsSync(envPath) || fs.existsSync(envProductionPath);

  checks.push({
    name: 'Environment file (.env or .env.production)',
    passed: hasEnv,
    path: fs.existsSync(envProductionPath) ? envProductionPath : envPath,
    detail: fs.existsSync(envProductionPath) ? '.env.production found' :
            fs.existsSync(envPath) ? '.env found' : 'NOT FOUND'
  });

  // Check 5: Critical dependencies exist
  const nodeModulesPath = path.join(workingDir, 'node_modules');
  const nodeModulesExists = fs.existsSync(nodeModulesPath);

  let criticalModules = [];
  if (nodeModulesExists) {
    const modules = ['express', 'mysql2', 'puppeteer', 'dotenv', 'cors'];
    criticalModules = modules.filter(mod => {
      const modPath = path.join(nodeModulesPath, mod);
      return fs.existsSync(modPath);
    });
  }

  checks.push({
    name: 'Node modules',
    passed: nodeModulesExists && criticalModules.length >= 3,
    path: nodeModulesPath,
    detail: `${criticalModules.length}/5 critical modules found: ${criticalModules.join(', ')}`
  });

  // Print results
  console.log('Prerequisite Checks:\n');
  checks.forEach((check, i) => {
    const icon = check.passed ? '✓' : '✗';
    const status = check.passed ? 'PASS' : 'FAIL';
    console.log(`${i + 1}. [${icon}] ${check.name}: ${status}`);
    console.log(`   Path: ${check.path}`);
    if (check.detail) {
      console.log(`   Detail: ${check.detail}`);
    }
    console.log('');
  });

  console.log('='.repeat(50));
  if (allPassed) {
    console.log('✅ All prerequisite checks passed!');
    console.log('✅ Server should start successfully');
  } else {
    console.log('❌ Some prerequisite checks failed!');
    console.log('❌ Server may not start properly');
    console.log('\nPlease check the failed items above and fix them.');
  }
  console.log('='.repeat(50) + '\n');

  return { allPassed, checks };
}

module.exports = { checkWindowsPrerequisites };
