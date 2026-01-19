/**
 * Database Connection Test Tool
 * Run this to diagnose database connection issues on Windows
 *
 * Usage: node utils/test-db-connection.js
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '../.env.production');
if (fs.existsSync(envPath)) {
  console.log('Loading .env.production from:', envPath);
  dotenv.config({ path: envPath });
} else {
  console.log('Loading .env');
  dotenv.config();
}

async function testDatabaseConnection() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 Database Connection Diagnostic Tool');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check environment variables
  console.log('📋 Configuration:');
  console.log('   Host:', process.env.DB_HOST || 'NOT SET');
  console.log('   Port:', process.env.DB_PORT || 'NOT SET');
  console.log('   User:', process.env.DB_USER || 'NOT SET');
  console.log('   Database:', process.env.DB_NAME || 'NOT SET');
  console.log('   Password:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'NOT SET');
  console.log('');

  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    console.error('❌ Error: Database credentials not found in .env file\n');
    process.exit(1);
  }

  // Test 1: DNS Resolution
  console.log('🧪 Test 1: DNS Resolution');
  try {
    const dns = require('dns').promises;
    const addresses = await dns.resolve4(process.env.DB_HOST);
    console.log('   ✅ DNS resolution successful');
    console.log('   IP Address:', addresses[0]);
  } catch (error) {
    console.error('   ❌ DNS resolution failed:', error.message);
    console.error('   💡 Check your internet connection\n');
    process.exit(1);
  }
  console.log('');

  // Test 2: TCP Connection
  console.log('🧪 Test 2: TCP Connection (Port', process.env.DB_PORT + ')');
  try {
    const net = require('net');
    await new Promise((resolve, reject) => {
      const socket = net.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        timeout: 10000
      });

      socket.on('connect', () => {
        console.log('   ✅ TCP connection successful');
        socket.destroy();
        resolve();
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });

      socket.on('error', (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error('   ❌ TCP connection failed:', error.message);
    console.error('');
    console.error('   💡 Possible causes:');
    console.error('      1. Windows Firewall is blocking port', process.env.DB_PORT);
    console.error('      2. RDS Security Group doesn\'t allow your IP');
    console.error('      3. Antivirus software is blocking the connection');
    console.error('');
    console.error('   🔧 Solutions:');
    console.error('      - Add Windows Firewall exception for port', process.env.DB_PORT);
    console.error('      - Contact admin to whitelist your IP in AWS RDS Security Group');
    console.error('      - Temporarily disable antivirus and try again\n');
    process.exit(1);
  }
  console.log('');

  // Test 3: MySQL Authentication
  console.log('🧪 Test 3: MySQL Authentication & Connection');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT),
      connectTimeout: 10000
    });

    console.log('   ✅ MySQL authentication successful');
  } catch (error) {
    console.error('   ❌ MySQL authentication failed:', error.message);
    console.error('');
    console.error('   💡 Possible causes:');
    console.error('      1. Incorrect database credentials');
    console.error('      2. User doesn\'t have access from this IP');
    console.error('      3. Database doesn\'t exist\n');
    process.exit(1);
  }
  console.log('');

  // Test 4: Query Execution
  console.log('🧪 Test 4: Query Execution');
  try {
    const [rows] = await connection.execute('SELECT 1 + 1 AS result, NOW() AS current_time');
    console.log('   ✅ Query execution successful');
    console.log('   Result:', rows[0].result);
    console.log('   Database Time:', rows[0].current_time);
  } catch (error) {
    console.error('   ❌ Query execution failed:', error.message);
    await connection.end();
    process.exit(1);
  }
  console.log('');

  // Test 5: Check Tables
  console.log('🧪 Test 5: Database Tables Check');
  try {
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('   ✅ Found', tables.length, 'tables in database');
    if (tables.length > 0) {
      console.log('   Tables:', tables.slice(0, 5).map(t => Object.values(t)[0]).join(', '), tables.length > 5 ? '...' : '');
    }
  } catch (error) {
    console.error('   ❌ Failed to list tables:', error.message);
  }
  console.log('');

  // Close connection
  await connection.end();

  // Success
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ ALL TESTS PASSED!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('Your database connection is working correctly.');
  console.log('The backend server should start without issues.\n');
}

// Run the test
testDatabaseConnection().catch((error) => {
  console.error('\n❌ Unexpected error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
