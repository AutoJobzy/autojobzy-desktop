/**
 * Run Super Admin SQL Migration
 * Run: node server/runMigration.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const runMigration = async () => {
    try {
        console.log('🔧 Connecting to database...');

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'job_automation',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true,
            ssl: {
                rejectUnauthorized: false
            }
        });

        console.log('✅ Connected to database');

        // Read SQL migration file
        const sqlFile = path.join(__dirname, 'migrations', 'add_super_admin_system.sql');
        const sql = readFileSync(sqlFile, 'utf8');

        console.log('📝 Running SQL migration...');

        // Execute the SQL
        await connection.query(sql);

        console.log('✅ SQL migration completed successfully!');
        console.log('\n📊 Tables created:');
        console.log('   - institutes');
        console.log('   - packages');
        console.log('   - institute_subscriptions');
        console.log('   - institute_admins');
        console.log('   - institute_staff');
        console.log('   - institute_students');
        console.log('\n📦 Default packages added:');
        console.log('   - Basic Plan (500 students, ₹60,000/month)');
        console.log('   - Standard Plan (1000 students, ₹100,000/month)');
        console.log('   - Premium Plan (2000 students, ₹180,000/month)');

        await connection.end();
        console.log('\n✅ Done!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

runMigration();
