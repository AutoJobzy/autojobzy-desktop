/**
 * Check users table structure
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const checkTable = async () => {
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

        console.log('📊 Users table structure:');
        const [rows] = await connection.execute('DESCRIBE users');
        console.table(rows);

        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkTable();
