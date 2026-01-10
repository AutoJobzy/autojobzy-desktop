/**
 * Check which super admin tables exist
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const checkTables = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'job_automation',
            port: process.env.DB_PORT || 3306,
            ssl: {
                rejectUnauthorized: false
            }
        });

        console.log('📊 Checking super admin tables...\n');

        const tablesToCheck = [
            'institutes',
            'packages',
            'institute_subscriptions',
            'institute_admins',
            'institute_staff',
            'institute_students'
        ];

        for (const table of tablesToCheck) {
            try {
                const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
                if (rows.length > 0) {
                    console.log(`✅ ${table} - exists`);

                    // Get row count
                    const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
                    console.log(`   Rows: ${count[0].count}`);
                } else {
                    console.log(`❌ ${table} - missing`);
                }
            } catch (err) {
                console.log(`❌ ${table} - error: ${err.message}`);
            }
        }

        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkTables();
