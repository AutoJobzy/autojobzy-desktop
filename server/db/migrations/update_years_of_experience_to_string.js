/**
 * Migration: Update yearsOfExperience from TINYINT to VARCHAR(20)
 * Run: node server/db/migrations/update_years_of_experience_to_string.js
 */

import sequelize from '../config.js';

async function migrate() {
    console.log('\n========================================');
    console.log('Migrating yearsOfExperience column...');
    console.log('========================================\n');

    try {
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Update column type from TINYINT to VARCHAR(20)
        console.log('🔄 Updating column type...');
        await sequelize.query(`
            ALTER TABLE job_settings
            MODIFY COLUMN years_of_experience VARCHAR(20)
            DEFAULT '0 years'
            COMMENT 'Years of experience for job search filtering (format: "X years")';
        `);

        console.log('✅ Column type updated successfully\n');

        // Update existing numeric values to "X years" format
        console.log('🔄 Converting existing values to "X years" format...');

        // Get all records with numeric values
        const [records] = await sequelize.query(`
            SELECT id, years_of_experience
            FROM job_settings
            WHERE years_of_experience REGEXP '^[0-9]+$';
        `);

        if (records.length > 0) {
            console.log(`📊 Found ${records.length} records to update\n`);

            for (const record of records) {
                const numericValue = record.years_of_experience;
                const newValue = `${numericValue} years`;

                await sequelize.query(`
                    UPDATE job_settings
                    SET years_of_experience = ?
                    WHERE id = ?;
                `, {
                    replacements: [newValue, record.id]
                });

                console.log(`   ✓ Updated record ${record.id}: "${numericValue}" → "${newValue}"`);
            }

            console.log('\n✅ All records updated successfully\n');
        } else {
            console.log('ℹ️ No numeric values found to convert\n');
        }

        console.log('========================================');
        console.log('✅ Migration completed successfully!');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n❌ Migration failed:');
        console.error(error.message);
        console.error('\n');
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

migrate();
