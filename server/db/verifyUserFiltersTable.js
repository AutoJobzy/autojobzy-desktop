/**
 * Verify and fix user_filters table schema
 * Ensures finalUrl column exists
 */

import sequelize from './config.js';

async function verifyUserFiltersTable() {
    try {
        console.log('[DB Check] Verifying user_filters table schema...');

        // Check if finalUrl column exists
        const [results] = await sequelize.query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_filters'
            ORDER BY ORDINAL_POSITION;
        `);

        console.log('\n[DB Check] Current user_filters columns:');
        results.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''}`);
        });

        // Check if finalUrl exists
        const hasFinalUrl = results.some(col => col.COLUMN_NAME === 'finalUrl');

        if (!hasFinalUrl) {
            console.log('\n[DB Check] ❌ finalUrl column is MISSING!');
            console.log('[DB Check] Adding finalUrl column...');

            await sequelize.query(`
                ALTER TABLE user_filters
                ADD COLUMN finalUrl VARCHAR(2000) NULL
                AFTER featuredCompanies;
            `);

            console.log('[DB Check] ✅ finalUrl column added successfully!');
        } else {
            console.log('\n[DB Check] ✅ finalUrl column exists!');
        }

        // Verify the fix
        const [updatedResults] = await sequelize.query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_filters'
            AND COLUMN_NAME = 'finalUrl';
        `);

        if (updatedResults.length > 0) {
            console.log('[DB Check] Final verification: finalUrl column details:');
            console.log(`  Type: ${updatedResults[0].DATA_TYPE}`);
            console.log(`  Max Length: ${updatedResults[0].CHARACTER_MAXIMUM_LENGTH}`);
        }

        console.log('\n[DB Check] ✅ Verification complete!');
        process.exit(0);
    } catch (error) {
        console.error('[DB Check] ❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

verifyUserFiltersTable();
