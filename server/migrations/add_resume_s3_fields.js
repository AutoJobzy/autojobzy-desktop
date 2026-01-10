/**
 * ======================== MIGRATION: Add Resume S3 Fields ========================
 * Adds resume_s3_url and resume_s3_key columns to job_settings table
 * Run this migration to update existing database schema for S3 resume storage
 *
 * Usage: node server/migrations/add_resume_s3_fields.js
 */

import sequelize from '../db/config.js';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
    try {
        console.log('🔄 Starting migration: Add S3 fields to job_settings table...');

        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Check if resume_s3_url column already exists
        const [urlResults] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'job_settings'
            AND COLUMN_NAME = 'resume_s3_url'
        `);

        if (urlResults.length === 0) {
            // Add resume_s3_url column
            await sequelize.query(`
                ALTER TABLE job_settings
                ADD COLUMN resume_s3_url VARCHAR(500) NULL
                COMMENT 'S3 URL of uploaded resume'
            `);
            console.log('✅ Successfully added resume_s3_url column');
        } else {
            console.log('ℹ️  Column resume_s3_url already exists. Skipping.');
        }

        // Check if resume_s3_key column already exists
        const [keyResults] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'job_settings'
            AND COLUMN_NAME = 'resume_s3_key'
        `);

        if (keyResults.length === 0) {
            // Add resume_s3_key column
            await sequelize.query(`
                ALTER TABLE job_settings
                ADD COLUMN resume_s3_key VARCHAR(500) NULL
                COMMENT 'S3 object key for resume file'
            `);
            console.log('✅ Successfully added resume_s3_key column');
        } else {
            console.log('ℹ️  Column resume_s3_key already exists. Skipping.');
        }

        console.log('✅ Migration completed successfully');
        console.log('\n📋 Summary:');
        console.log('   - resume_s3_url: Stores the full S3 URL of the uploaded resume');
        console.log('   - resume_s3_key: Stores the S3 object key for file operations');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigration();
