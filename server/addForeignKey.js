/**
 * Add foreign key constraint and indexes to users table
 */

import sequelize from './db/config.js';

const addConstraints = async () => {
    try {
        console.log('🔄 Adding foreign key constraint and indexes...');

        // Check if foreign key already exists
        const [foreignKeys] = await sequelize.query(`
            SELECT CONSTRAINT_NAME
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'users'
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
            AND CONSTRAINT_NAME = 'fk_users_institute'
        `);

        if (foreignKeys.length === 0) {
            console.log('📝 Adding foreign key constraint...');
            await sequelize.query(`
                ALTER TABLE users
                ADD CONSTRAINT fk_users_institute
                FOREIGN KEY (institute_id)
                REFERENCES institutes(id)
                ON DELETE SET NULL
            `);
            console.log('✅ Foreign key constraint added successfully');
        } else {
            console.log('ℹ️  Foreign key constraint already exists');
        }

        // Add indexes
        try {
            await sequelize.query(`
                CREATE INDEX idx_users_institute_id ON users(institute_id)
            `);
            console.log('✅ Index on institute_id created successfully');
        } catch (error) {
            if (error.message.includes('Duplicate key name')) {
                console.log('ℹ️  Index on institute_id already exists');
            } else {
                console.error('Warning: Could not create index on institute_id:', error.message);
            }
        }

        try {
            await sequelize.query(`
                CREATE INDEX idx_users_role ON users(role)
            `);
            console.log('✅ Index on role created successfully');
        } catch (error) {
            if (error.message.includes('Duplicate key name')) {
                console.log('ℹ️  Index on role already exists');
            } else {
                console.error('Warning: Could not create index on role:', error.message);
            }
        }

        console.log('\n✅ All constraints and indexes added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

addConstraints();
