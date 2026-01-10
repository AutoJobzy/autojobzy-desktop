/**
 * Update users table schema to support new roles and instituteId
 */

import sequelize from './db/config.js';

const updateUsersTable = async () => {
    try {
        console.log('🔄 Starting users table migration...');

        // Step 1: Modify the role column
        console.log('📝 Updating role column...');
        await sequelize.query(`
            ALTER TABLE users
            MODIFY COLUMN role ENUM('user', 'admin', 'superadmin', 'institute_admin', 'staff', 'student')
            NOT NULL DEFAULT 'user'
        `);
        console.log('✅ Role column updated successfully');

        // Step 2: Add instituteId column if it doesn't exist
        console.log('📝 Adding institute_id column...');
        try {
            await sequelize.query(`
                ALTER TABLE users
                ADD COLUMN institute_id VARCHAR(36) NULL
            `);
            console.log('✅ institute_id column added successfully');
        } catch (error) {
            if (error.message.includes('Duplicate column name')) {
                console.log('ℹ️  institute_id column already exists');
            } else {
                throw error;
            }
        }

        // Step 3: Add foreign key constraint
        console.log('📝 Adding foreign key constraint...');
        try {
            await sequelize.query(`
                ALTER TABLE users
                ADD CONSTRAINT fk_users_institute
                FOREIGN KEY (institute_id)
                REFERENCES institutes(id)
                ON DELETE SET NULL
            `);
            console.log('✅ Foreign key constraint added successfully');
        } catch (error) {
            if (error.message.includes('Duplicate key') || error.message.includes('already exists')) {
                console.log('ℹ️  Foreign key constraint already exists');
            } else {
                throw error;
            }
        }

        // Step 4: Add indexes
        console.log('📝 Adding indexes...');
        try {
            await sequelize.query(`
                CREATE INDEX idx_users_institute_id ON users(institute_id)
            `);
            console.log('✅ Index on institute_id created successfully');
        } catch (error) {
            if (error.message.includes('Duplicate key name')) {
                console.log('ℹ️  Index on institute_id already exists');
            } else {
                throw error;
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
                throw error;
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

updateUsersTable();
