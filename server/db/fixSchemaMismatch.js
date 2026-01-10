/**
 * Fix Schema Mismatch
 * Adds missing columns to skills and user_filters tables
 */

import sequelize from './config.js';

async function fixSchema() {
    try {
        console.log('Checking and fixing schema mismatches...');

        // Check skills table for display_name column
        const [skillsColumns] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
            AND TABLE_NAME = 'skills'
        `);

        const hasDisplayName = skillsColumns.some(col => col.COLUMN_NAME === 'display_name');

        if (!hasDisplayName) {
            console.log('Adding display_name column to skills table...');
            await sequelize.query(`
                ALTER TABLE skills
                ADD COLUMN display_name VARCHAR(255) NULL
                COMMENT 'Display name for UI (e.g., Java, Spring Boot, Angular)'
            `);
            console.log('✓ Added display_name column to skills table');
        } else {
            console.log('✓ skills.display_name already exists');
        }

        // Check user_filters table for freshness column
        const [userFiltersColumns] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
            AND TABLE_NAME = 'user_filters'
        `);

        const hasFreshness = userFiltersColumns.some(col => col.COLUMN_NAME === 'freshness');

        if (!hasFreshness) {
            console.log('Adding freshness column to user_filters table...');
            await sequelize.query(`
                ALTER TABLE user_filters
                ADD COLUMN freshness TEXT NULL
                COMMENT 'Job posting freshness filter'
            `);
            console.log('✓ Added freshness column to user_filters table');
        } else {
            console.log('✓ user_filters.freshness already exists');
        }

        console.log('\n✅ Schema fix completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error fixing schema:', error);
        process.exit(1);
    }
}

fixSchema();
