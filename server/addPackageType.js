/**
 * Add type field to packages table
 */

import sequelize from './db/config.js';

const addPackageType = async () => {
    try {
        console.log('🔄 Adding type field to packages table...');

        // Add type column
        console.log('📝 Adding type column...');
        try {
            await sequelize.query(`
                ALTER TABLE packages
                ADD COLUMN type ENUM('individual', 'institute')
                NOT NULL DEFAULT 'institute'
                AFTER features
            `);
            console.log('✅ Type column added successfully');
        } catch (error) {
            if (error.message.includes('Duplicate column name')) {
                console.log('ℹ️  Type column already exists');
            } else {
                throw error;
            }
        }

        // Add index on type for better filtering
        try {
            await sequelize.query(`
                CREATE INDEX idx_packages_type ON packages(type)
            `);
            console.log('✅ Index on type created successfully');
        } catch (error) {
            if (error.message.includes('Duplicate key name')) {
                console.log('ℹ️  Index on type already exists');
            } else {
                console.error('Warning: Could not create index on type:', error.message);
            }
        }

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

addPackageType();
