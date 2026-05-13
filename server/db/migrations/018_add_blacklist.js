/**
 * Migration #018: Add Blacklist Feature
 *
 * 1. Adds `blacklist_enabled` column to `job_settings`
 * 2. Creates `blacklisted_companies` table
 */

import sequelize from '../config.js';

async function addBlacklist() {
    try {
        console.log('\n========================================');
        console.log('MIGRATION #018: ADD BLACKLIST FEATURE');
        console.log('========================================\n');

        // ── STEP 1: Add blacklist_enabled to job_settings ──────────────────
        const [existingCols] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'job_settings'
              AND COLUMN_NAME = 'blacklist_enabled';
        `);

        if (existingCols.length === 0) {
            await sequelize.query(`
                ALTER TABLE job_settings
                ADD COLUMN blacklist_enabled BOOLEAN DEFAULT FALSE
                    COMMENT 'Whether blacklisted companies should be skipped during automation';
            `);
            console.log('✅ Added column: blacklist_enabled → job_settings');
        } else {
            console.log('⏭️  Column already exists: blacklist_enabled');
        }

        // ── STEP 2: Create blacklisted_companies table ─────────────────────
        const [existingTables] = await sequelize.query(`
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'blacklisted_companies';
        `);

        if (existingTables.length === 0) {
            await sequelize.query(`
                CREATE TABLE blacklisted_companies (
                    id             INT AUTO_INCREMENT PRIMARY KEY,
                    user_id        CHAR(36)     CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
                    company_name   VARCHAR(255) NOT NULL COMMENT 'Raw company name as entered by user',
                    normalized_name VARCHAR(255) NOT NULL COMMENT 'Lowercase + suffix-stripped name for fast matching',
                    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                    INDEX idx_blacklist_user (user_id),
                    UNIQUE KEY unique_user_company (user_id, normalized_name),
                    CONSTRAINT fk_blacklist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
            console.log('✅ Created table: blacklisted_companies');
        } else {
            console.log('⏭️  Table already exists: blacklisted_companies');
        }

        console.log('\n========================================');
        console.log('✅ MIGRATION #018 COMPLETE!');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration #018 failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

addBlacklist();
