/**
 * Add missing columns to plans table
 */

import sequelize from './config.js';

async function updatePlansTable() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database\n');

        console.log('📄 Adding missing columns to plans table...\n');

        // Add description column
        try {
            await sequelize.query(`
                ALTER TABLE plans
                ADD COLUMN description VARCHAR(500) DEFAULT NULL
            `);
            console.log('✅ Added description column');
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log('ℹ️  description column already exists');
            } else {
                throw error;
            }
        }

        // Add subtitle column
        try {
            await sequelize.query(`
                ALTER TABLE plans
                ADD COLUMN subtitle VARCHAR(255) DEFAULT NULL
            `);
            console.log('✅ Added subtitle column');
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log('ℹ️  subtitle column already exists');
            } else {
                throw error;
            }
        }

        // Add is_popular column
        try {
            await sequelize.query(`
                ALTER TABLE plans
                ADD COLUMN is_popular TINYINT(1) DEFAULT 0
            `);
            console.log('✅ Added is_popular column');
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log('ℹ️  is_popular column already exists');
            } else {
                throw error;
            }
        }

        // Add coming_soon column
        try {
            await sequelize.query(`
                ALTER TABLE plans
                ADD COLUMN coming_soon TINYINT(1) DEFAULT 0
            `);
            console.log('✅ Added coming_soon column');
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log('ℹ️  coming_soon column already exists');
            } else {
                throw error;
            }
        }

        // Add sort_order column
        try {
            await sequelize.query(`
                ALTER TABLE plans
                ADD COLUMN sort_order INT DEFAULT 0
            `);
            console.log('✅ Added sort_order column');
        } catch (error) {
            if (error.message.includes('Duplicate column')) {
                console.log('ℹ️  sort_order column already exists');
            } else {
                throw error;
            }
        }

        console.log('\n✅ Plans table updated successfully!');
        console.log('\n📋 Verifying new structure...');

        const [columns] = await sequelize.query('DESCRIBE plans');
        console.table(columns.map(col => ({ Field: col.Field, Type: col.Type, Null: col.Null, Default: col.Default })));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

updatePlansTable();
