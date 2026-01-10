/**
 * ======================== MIGRATION: Create Expenses Table ========================
 * Creates expenses table for financial tracking
 * Run this migration to create the expenses table
 *
 * Usage: node server/migrations/create_expenses_table.js
 */

import sequelize from '../db/config.js';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
    try {
        console.log('🔄 Starting migration: Create expenses table...');

        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Check if table already exists
        const [tables] = await sequelize.query(`
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'expenses'
        `);

        if (tables.length > 0) {
            console.log('ℹ️  Table expenses already exists. Skipping migration.');
        } else {
            // Create expenses table
            await sequelize.query(`
                CREATE TABLE expenses (
                    id CHAR(36) NOT NULL PRIMARY KEY,
                    category ENUM('server', 'api', 'email', 'support', 'marketing', 'operations', 'miscellaneous') NOT NULL,
                    amount DECIMAL(10, 2) NOT NULL,
                    date DATE NOT NULL,
                    notes TEXT NULL,
                    created_by VARCHAR(255) NULL,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);
            console.log('✅ Successfully created expenses table');
        }

        console.log('✅ Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
