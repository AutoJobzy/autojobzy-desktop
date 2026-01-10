/**
 * Migration: Add last_profile_update column to job_settings
 * Tracks when user's Naukri profile was last updated
 */

import sequelize from '../config.js';

async function addLastProfileUpdateColumn() {
    try {
        console.log('\n========================================');
        console.log('ADDING last_profile_update COLUMN');
        console.log('========================================\n');

        // Step 1: Check if column already exists
        const [columns] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'job_settings'
            AND COLUMN_NAME = 'last_profile_update';
        `);

        if (columns.length > 0) {
            console.log('✅ Column last_profile_update already exists');
            console.log('\n========================================');
            console.log('✅ MIGRATION COMPLETE (No changes needed)');
            console.log('========================================\n');
            process.exit(0);
            return;
        }

        console.log('❌ Column last_profile_update missing');
        console.log('Adding column...\n');

        // Step 2: Add column
        await sequelize.query(`
            ALTER TABLE job_settings
            ADD COLUMN last_profile_update DATETIME NULL DEFAULT NULL
            COMMENT 'Timestamp of last Naukri profile update';
        `);

        console.log('✅ Column added successfully!');

        // Step 3: Verify
        const [verification] = await sequelize.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'job_settings'
            AND COLUMN_NAME = 'last_profile_update';
        `);

        if (verification.length > 0) {
            console.log('\n========================================');
            console.log('VERIFICATION');
            console.log('========================================\n');
            console.log('Column Details:');
            console.log(`  Name: ${verification[0].COLUMN_NAME}`);
            console.log(`  Type: ${verification[0].DATA_TYPE}`);
            console.log(`  Nullable: ${verification[0].IS_NULLABLE}`);
            console.log(`  Comment: ${verification[0].COLUMN_COMMENT || 'N/A'}`);
        }

        console.log('\n========================================');
        console.log('✅ MIGRATION COMPLETE!');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

addLastProfileUpdateColumn();
