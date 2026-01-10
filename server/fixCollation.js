/**
 * Fix collation mismatch for institute_id column
 */

import sequelize from './db/config.js';

const fixCollation = async () => {
    try {
        console.log('🔄 Fixing collation mismatch...');

        // Update institute_id column to match institutes.id collation
        console.log('📝 Updating institute_id column collation...');
        await sequelize.query(`
            ALTER TABLE users
            MODIFY COLUMN institute_id CHAR(36)
            CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
            NULL
        `);
        console.log('✅ Collation updated successfully');

        // Now add foreign key
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

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

fixCollation();
