/**
 * ======================== MIGRATION: Add Personal Info Fields ========================
 * Adds fullName and contactNumber fields to job_settings table
 *
 * Usage: node server/migrations/add_personal_info_fields.js
 */

import sequelize from '../db/config.js';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
    try {
        console.log('🔄 Starting migration: Add personal info fields...');

        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Check if fullName column exists
        const [fullNameResults] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'job_settings'
            AND COLUMN_NAME = 'full_name'
        `);

        if (fullNameResults.length === 0) {
            await sequelize.query(`
                ALTER TABLE job_settings
                ADD COLUMN full_name VARCHAR(255) NULL
                COMMENT 'User full name for job applications'
            `);
            console.log('✅ Successfully added full_name column');
        } else {
            console.log('ℹ️  full_name column already exists. Skipping.');
        }

        // Check if contactNumber column exists
        const [contactResults] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'job_settings'
            AND COLUMN_NAME = 'contact_number'
        `);

        if (contactResults.length === 0) {
            await sequelize.query(`
                ALTER TABLE job_settings
                ADD COLUMN contact_number VARCHAR(20) NULL
                COMMENT 'Contact number for job applications'
            `);
            console.log('✅ Successfully added contact_number column');
        } else {
            console.log('ℹ️  contact_number column already exists. Skipping.');
        }

        console.log('✅ Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

runMigration();
