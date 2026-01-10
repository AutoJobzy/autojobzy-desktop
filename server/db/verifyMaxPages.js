/**
 * Verify maxPages column exists in job_settings table
 * Run: node server/db/verifyMaxPages.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function verifyMaxPagesColumn() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'database-1.c72i2s6muax7.ap-south-1.rds.amazonaws.com',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'admin',
        password: process.env.DB_PASSWORD || 'YsjlUaX5yFJGtZqjmrSj',
        database: process.env.DB_NAME || 'jobautomate',
    });

    try {
        console.log('🔍 Checking job_settings table schema...\n');

        // Check if maxPages column exists
        const [columns] = await connection.execute(
            `SELECT
                COLUMN_NAME,
                COLUMN_TYPE,
                COLUMN_DEFAULT,
                IS_NULLABLE,
                COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'job_settings'
            ORDER BY ORDINAL_POSITION`
        );

        const maxPagesColumn = columns.find(col => col.COLUMN_NAME === 'maxPages');

        if (maxPagesColumn) {
            console.log('✅ maxPages column EXISTS in job_settings table\n');
            console.log('Column details:');
            console.log('  Name:', maxPagesColumn.COLUMN_NAME);
            console.log('  Type:', maxPagesColumn.COLUMN_TYPE);
            console.log('  Default:', maxPagesColumn.COLUMN_DEFAULT);
            console.log('  Nullable:', maxPagesColumn.IS_NULLABLE);
            console.log('  Comment:', maxPagesColumn.COLUMN_COMMENT || 'None');
        } else {
            console.log('❌ maxPages column DOES NOT EXIST in job_settings table\n');
            console.log('To add it, run one of the following:\n');
            console.log('Option 1: Run SQL script');
            console.log('  mysql -u root -p jobautomate < server/db/add_maxPages_column.sql\n');
            console.log('Option 2: Run SQL command directly');
            console.log('  ALTER TABLE job_settings ADD COLUMN maxPages INT DEFAULT 5 COMMENT \'Maximum pages to process during automation\';\n');
        }

        console.log('\n📋 All columns in job_settings table:');
        console.log('─'.repeat(80));
        columns.forEach((col, idx) => {
            const highlight = col.COLUMN_NAME === 'maxPages' ? '✨ ' : '   ';
            console.log(`${highlight}${idx + 1}. ${col.COLUMN_NAME} (${col.COLUMN_TYPE}) - Default: ${col.COLUMN_DEFAULT || 'NULL'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

verifyMaxPagesColumn();
