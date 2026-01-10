/**
 * Migration #017: Add Profile Update Scheduler Columns
 *
 * Adds columns to job_settings table for automatic profile update scheduling:
 * - profile_update_enabled: Boolean flag to enable/disable auto-updates
 * - profile_update_frequency: How often to update (in days)
 * - profile_update_next_run: When the next update is scheduled
 * - profile_update_last_status: Status of last update attempt
 */

import sequelize from '../config.js';

async function addProfileUpdateSchedulerColumns() {
    try {
        console.log('\n========================================');
        console.log('MIGRATION #017: ADD PROFILE UPDATE SCHEDULER COLUMNS');
        console.log('========================================\n');

        // Check if columns already exist
        const [existingColumns] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'job_settings'
            AND COLUMN_NAME IN ('profile_update_enabled', 'profile_update_frequency', 'profile_update_next_run', 'profile_update_last_status', 'profile_update_schedule_time');
        `);

        if (existingColumns.length === 5) {
            console.log('✅ All profile update scheduler columns already exist');
            console.log('\n========================================');
            console.log('✅ MIGRATION COMPLETE (No changes needed)');
            console.log('========================================\n');
            process.exit(0);
            return;
        }

        console.log(`Found ${existingColumns.length}/5 columns. Adding missing columns...\n`);

        // Add columns one by one to avoid IF NOT EXISTS issues
        const columnsToAdd = [
            {
                name: 'profile_update_enabled',
                sql: "ADD COLUMN profile_update_enabled BOOLEAN DEFAULT FALSE COMMENT 'Is auto profile update enabled'"
            },
            {
                name: 'profile_update_frequency',
                sql: "ADD COLUMN profile_update_frequency INT DEFAULT 1 COMMENT 'Update frequency in days'"
            },
            {
                name: 'profile_update_schedule_time',
                sql: "ADD COLUMN profile_update_schedule_time TIME DEFAULT '09:00:00' COMMENT 'Time of day to run the update (HH:MM:SS)'"
            },
            {
                name: 'profile_update_next_run',
                sql: "ADD COLUMN profile_update_next_run DATETIME NULL COMMENT 'Next scheduled profile update time'"
            },
            {
                name: 'profile_update_last_status',
                sql: "ADD COLUMN profile_update_last_status VARCHAR(50) DEFAULT 'idle' COMMENT 'Last update status'"
            }
        ];

        for (const column of columnsToAdd) {
            const exists = existingColumns.some(col => col.COLUMN_NAME === column.name);
            if (!exists) {
                await sequelize.query(`ALTER TABLE job_settings ${column.sql}`);
                console.log(`✅ Added column: ${column.name}`);
            } else {
                console.log(`⏭️  Column already exists: ${column.name}`);
            }
        }

        console.log('\n✅ All columns processed successfully!\n');

        // Verify all columns were added
        const [verification] = await sequelize.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'job_settings'
            AND COLUMN_NAME IN ('profile_update_enabled', 'profile_update_frequency', 'profile_update_schedule_time', 'profile_update_next_run', 'profile_update_last_status')
            ORDER BY COLUMN_NAME;
        `);

        console.log('========================================');
        console.log('VERIFICATION');
        console.log('========================================\n');
        console.log(`Found ${verification.length} columns:\n`);

        verification.forEach((col) => {
            console.log(`  ✓ ${col.COLUMN_NAME}`);
            console.log(`    Type: ${col.DATA_TYPE}`);
            console.log(`    Nullable: ${col.IS_NULLABLE}`);
            console.log(`    Default: ${col.COLUMN_DEFAULT || 'NULL'}`);
            console.log(`    Comment: ${col.COLUMN_COMMENT || 'N/A'}\n`);
        });

        console.log('========================================');
        console.log('✅ MIGRATION #017 COMPLETE!');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration #017 failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

addProfileUpdateSchedulerColumns();
