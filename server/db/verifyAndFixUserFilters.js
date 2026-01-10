/**
 * Comprehensive verification and fix for user_filters table
 * Ensures all required columns exist with correct types
 */

import sequelize from './config.js';

async function verifyAndFixUserFiltersTable() {
    try {
        console.log('\n========================================');
        console.log('USER_FILTERS TABLE VERIFICATION');
        console.log('========================================\n');

        // Step 1: Check if table exists
        const [tables] = await sequelize.query(`
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_filters';
        `);

        if (tables.length === 0) {
            console.log('❌ user_filters table does NOT exist!');
            console.log('Creating user_filters table...\n');

            await sequelize.query(`
                CREATE TABLE user_filters (
                    id CHAR(36) PRIMARY KEY,
                    user_id CHAR(36) NOT NULL UNIQUE,
                    freshness TEXT,
                    salaryRange TEXT,
                    wfhType TEXT,
                    citiesGid TEXT,
                    functionalAreaGid TEXT,
                    industryTypeGid TEXT,
                    ugCourseGid TEXT,
                    pgCourseGid TEXT,
                    business_size TEXT,
                    employement TEXT,
                    glbl_RoleCat TEXT,
                    topGroupId TEXT,
                    featuredCompanies TEXT,
                    final_url VARCHAR(2000),
                    selected_filters JSON,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            `);

            console.log('✅ user_filters table created successfully!\n');
        } else {
            console.log('✅ user_filters table exists\n');
        }

        // Step 2: Get current columns
        const [columns] = await sequelize.query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_filters'
            ORDER BY ORDINAL_POSITION;
        `);

        console.log('Current columns in user_filters table:');
        console.log('----------------------------------------');
        columns.forEach(col => {
            const type = col.CHARACTER_MAXIMUM_LENGTH
                ? `${col.DATA_TYPE}(${col.CHARACTER_MAXIMUM_LENGTH})`
                : col.COLUMN_TYPE;
            const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
            console.log(`  ${col.COLUMN_NAME.padEnd(25)} ${type.padEnd(20)} ${nullable}`);
        });
        console.log('');

        // Step 3: Check for required columns and add if missing
        const columnNames = columns.map(col => col.COLUMN_NAME);
        const fixes = [];

        // Check for final_url column
        if (!columnNames.includes('final_url')) {
            console.log('❌ Missing column: final_url');
            fixes.push({
                name: 'final_url',
                sql: `ALTER TABLE user_filters ADD COLUMN final_url VARCHAR(2000) NULL;`
            });
        } else {
            console.log('✅ Column exists: final_url');
        }

        // Check for selected_filters column
        if (!columnNames.includes('selected_filters')) {
            console.log('❌ Missing column: selected_filters');
            fixes.push({
                name: 'selected_filters',
                sql: `ALTER TABLE user_filters ADD COLUMN selected_filters JSON NULL;`
            });
        } else {
            console.log('✅ Column exists: selected_filters');
        }

        // Check for created_at column
        if (!columnNames.includes('created_at') && !columnNames.includes('createdAt')) {
            console.log('❌ Missing column: created_at');
            fixes.push({
                name: 'created_at',
                sql: `ALTER TABLE user_filters ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;`
            });
        } else {
            console.log('✅ Column exists: created_at or createdAt');
        }

        // Check for updated_at column
        if (!columnNames.includes('updated_at') && !columnNames.includes('updatedAt')) {
            console.log('❌ Missing column: updated_at');
            fixes.push({
                name: 'updated_at',
                sql: `ALTER TABLE user_filters ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;`
            });
        } else {
            console.log('✅ Column exists: updated_at or updatedAt');
        }

        console.log('');

        // Step 4: Apply fixes if needed
        if (fixes.length > 0) {
            console.log(`\nApplying ${fixes.length} fix(es)...\n`);

            for (const fix of fixes) {
                console.log(`Adding column: ${fix.name}`);
                try {
                    await sequelize.query(fix.sql);
                    console.log(`✅ Successfully added ${fix.name}\n`);
                } catch (error) {
                    console.error(`❌ Failed to add ${fix.name}:`, error.message);
                }
            }
        } else {
            console.log('✅ All required columns exist!\n');
        }

        // Step 5: Final verification
        const [finalColumns] = await sequelize.query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_filters'
            AND COLUMN_NAME IN ('user_id', 'final_url', 'selected_filters', 'created_at', 'updated_at')
            ORDER BY COLUMN_NAME;
        `);

        console.log('\n========================================');
        console.log('FINAL VERIFICATION - Critical Columns');
        console.log('========================================\n');

        finalColumns.forEach(col => {
            const type = col.CHARACTER_MAXIMUM_LENGTH
                ? `${col.DATA_TYPE}(${col.CHARACTER_MAXIMUM_LENGTH})`
                : col.COLUMN_TYPE;
            console.log(`✅ ${col.COLUMN_NAME.padEnd(20)} ${type}`);
        });

        // Step 6: Check UNIQUE constraint on user_id
        console.log('\n========================================');
        console.log('UNIQUE CONSTRAINT VERIFICATION');
        console.log('========================================\n');

        const [uniqueIndexes] = await sequelize.query(`
            SELECT INDEX_NAME, NON_UNIQUE
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_filters'
            AND COLUMN_NAME = 'user_id';
        `);

        const hasUniqueConstraint = uniqueIndexes.some(idx => idx.NON_UNIQUE === 0);

        if (hasUniqueConstraint) {
            console.log('✅ UNIQUE constraint exists on user_id column');
            uniqueIndexes.forEach(idx => {
                const type = idx.NON_UNIQUE === 0 ? 'UNIQUE' : 'NON-UNIQUE';
                console.log(`   - ${idx.INDEX_NAME} (${type})`);
            });
        } else {
            console.log('⚠️  WARNING: UNIQUE constraint missing on user_id column');
            console.log('   Run: node server/db/migrations/add_unique_constraint_user_filters.js');
        }

        console.log('\n========================================');
        console.log('✅ VERIFICATION COMPLETE!');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

verifyAndFixUserFiltersTable();
