/**
 * ======================== MIGRATION: Add onboardingCompleted Field ========================
 * Adds onboarding_completed column to users table
 * Run this migration to update existing database schema
 *
 * Usage: node server/migrations/add_onboarding_completed.js
 */

import sequelize from '../db/config.js';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
    try {
        console.log('🔄 Starting migration: Add onboarding_completed to users table...');

        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Check if column already exists
        const [results] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'users'
            AND COLUMN_NAME = 'onboarding_completed'
        `);

        if (results.length > 0) {
            console.log('ℹ️  Column onboarding_completed already exists. Skipping migration.');
        } else {
            // Add column
            await sequelize.query(`
                ALTER TABLE users
                ADD COLUMN onboarding_completed TINYINT(1) NOT NULL DEFAULT 0
            `);
            console.log('✅ Successfully added onboarding_completed column to users table');
        }

        console.log('✅ Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
