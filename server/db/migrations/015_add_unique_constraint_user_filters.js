/**
 * Migration: Add UNIQUE constraint on user_id in user_filters table
 * Ensures one user can only have one set of filters
 */

import sequelize from '../config.js';

async function addUniqueConstraint() {
    try {
        console.log('\n========================================');
        console.log('ADDING UNIQUE CONSTRAINT TO user_filters');
        console.log('========================================\n');

        // Step 1: Check if constraint already exists
        const [constraints] = await sequelize.query(`
            SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_filters'
            AND (CONSTRAINT_TYPE = 'UNIQUE' OR CONSTRAINT_NAME LIKE '%user_id%');
        `);

        console.log('Current constraints on user_filters:');
        if (constraints.length === 0) {
            console.log('  No unique constraints found\n');
        } else {
            constraints.forEach(c => {
                console.log(`  - ${c.CONSTRAINT_NAME} (${c.CONSTRAINT_TYPE})`);
            });
            console.log('');
        }

        // Step 2: Check if user_id has unique index
        const [indexes] = await sequelize.query(`
            SELECT INDEX_NAME, NON_UNIQUE, COLUMN_NAME
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_filters'
            AND COLUMN_NAME = 'user_id';
        `);

        const hasUniqueIndex = indexes.some(idx => idx.NON_UNIQUE === 0);

        if (hasUniqueIndex) {
            console.log('✅ UNIQUE constraint already exists on user_id');
            console.log('\nExisting indexes on user_id:');
            indexes.forEach(idx => {
                console.log(`  - ${idx.INDEX_NAME} (${idx.NON_UNIQUE === 0 ? 'UNIQUE' : 'NON-UNIQUE'})`);
            });
        } else {
            console.log('❌ UNIQUE constraint missing on user_id');
            console.log('Adding UNIQUE constraint...\n');

            // Step 3: Check for duplicate user_id values before adding constraint
            const [duplicates] = await sequelize.query(`
                SELECT user_id, COUNT(*) as count
                FROM user_filters
                GROUP BY user_id
                HAVING COUNT(*) > 1;
            `);

            if (duplicates.length > 0) {
                console.log('⚠️  WARNING: Found duplicate user_id values:');
                duplicates.forEach(dup => {
                    console.log(`  - user_id: ${dup.user_id} (count: ${dup.count})`);
                });
                console.log('\n🔧 Cleaning up duplicates (keeping most recent)...\n');

                // For each duplicate, keep only the most recent record
                for (const dup of duplicates) {
                    await sequelize.query(`
                        DELETE FROM user_filters
                        WHERE user_id = :userId
                        AND id NOT IN (
                            SELECT id FROM (
                                SELECT id
                                FROM user_filters
                                WHERE user_id = :userId
                                ORDER BY updated_at DESC
                                LIMIT 1
                            ) as keeper
                        );
                    `, {
                        replacements: { userId: dup.user_id }
                    });
                    console.log(`  ✅ Cleaned up duplicates for user_id: ${dup.user_id}`);
                }
                console.log('');
            }

            // Step 4: Add UNIQUE constraint
            await sequelize.query(`
                ALTER TABLE user_filters
                ADD CONSTRAINT unique_user_id UNIQUE (user_id);
            `);

            console.log('✅ UNIQUE constraint added successfully!');
        }

        // Step 5: Final verification
        const [finalIndexes] = await sequelize.query(`
            SELECT INDEX_NAME, NON_UNIQUE, COLUMN_NAME
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'user_filters'
            AND COLUMN_NAME = 'user_id';
        `);

        console.log('\n========================================');
        console.log('FINAL VERIFICATION');
        console.log('========================================\n');
        console.log('Indexes on user_id column:');
        finalIndexes.forEach(idx => {
            const type = idx.NON_UNIQUE === 0 ? '✅ UNIQUE' : '⚠️  NON-UNIQUE';
            console.log(`  ${type}: ${idx.INDEX_NAME}`);
        });

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

addUniqueConstraint();
