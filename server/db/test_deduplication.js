/**
 * ========================================================================
 * DEDUPLICATION TEST SCRIPT
 * ========================================================================
 * Tests that duplicate company_url entries are properly handled
 *
 * Usage: node server/db/test_deduplication.js
 * ========================================================================
 */

import JobApplicationResult from '../models/JobApplicationResult.js';
import User from '../models/User.js';
import sequelize from './config.js';

const TEST_COMPANY_URL = 'https://test-company-deduplication.example.com/job/12345';

async function testDeduplication() {
    console.log('\n========================================================================');
    console.log('                    DEDUPLICATION TEST                                 ');
    console.log('========================================================================\n');

    try {
        // Ensure database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        // Get an existing user for testing (to satisfy foreign key constraint)
        const existingUser = await User.findOne();
        if (!existingUser) {
            console.log('❌ No users found in database. Please create a user first.');
            process.exit(1);
        }
        const TEST_USER_ID = existingUser.id;
        console.log(`📌 Using existing user: ${existingUser.email} (${TEST_USER_ID})\n`);

        // Test data
        const jobData = {
            userId: TEST_USER_ID,
            datetime: new Date().toISOString(),
            pageNumber: 1,
            jobNumber: 'TEST001',
            companyUrl: TEST_COMPANY_URL,
            earlyApplicant: true,
            keySkillsMatch: true,
            locationMatch: true,
            experienceMatch: false,
            matchScore: 4,
            matchScoreTotal: 5,
            matchStatus: 'Good Match',
            applyType: 'Direct Apply'
        };

        console.log('📝 Test Data:');
        console.log(`   User ID: ${TEST_USER_ID}`);
        console.log(`   Company URL: ${TEST_COMPANY_URL}\n`);

        // Test 1: Insert first record
        console.log('Test 1: Inserting first record...');
        try {
            const result1 = await JobApplicationResult.create(jobData);
            console.log(`✅ First record inserted successfully (ID: ${result1.id})\n`);
        } catch (error) {
            console.log(`❌ Failed to insert first record: ${error.message}\n`);
            throw error;
        }

        // Test 2: Attempt to insert duplicate (should be prevented)
        console.log('Test 2: Attempting to insert duplicate record...');
        try {
            const result2 = await JobApplicationResult.create(jobData);
            console.log(`❌ TEST FAILED: Duplicate was inserted (ID: ${result2.id})`);
            console.log('   UNIQUE constraint is NOT working!\n');
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                console.log(`✅ TEST PASSED: Duplicate was properly rejected`);
                console.log(`   Error: ${error.errors[0].message}\n`);
            } else {
                console.log(`❌ Unexpected error: ${error.message}\n`);
                throw error;
            }
        }

        // Test 3: Bulk insert with ignoreDuplicates
        console.log('Test 3: Testing bulk insert with ignoreDuplicates...');

        // Count records before bulk insert
        const countBefore = await JobApplicationResult.count({
            where: { userId: TEST_USER_ID }
        });

        const bulkData = [
            { ...jobData, jobNumber: 'TEST002' }, // Duplicate company_url
            { ...jobData, jobNumber: 'TEST003', companyUrl: TEST_COMPANY_URL + '-new' }, // New company
            { ...jobData, jobNumber: 'TEST004' }, // Duplicate company_url again
        ];

        try {
            const bulkResults = await JobApplicationResult.bulkCreate(bulkData, {
                ignoreDuplicates: true,
                validate: true,
                returning: true
            });

            // Count records after bulk insert to see actual insertions
            const countAfter = await JobApplicationResult.count({
                where: { userId: TEST_USER_ID }
            });

            const actualInserted = countAfter - countBefore;
            const duplicatesSkipped = bulkData.length - actualInserted;

            console.log(`✅ Bulk insert completed`);
            console.log(`   Total records attempted: ${bulkData.length}`);
            console.log(`   Records before insert: ${countBefore}`);
            console.log(`   Records after insert: ${countAfter}`);
            console.log(`   Actually inserted: ${actualInserted}`);
            console.log(`   Duplicates skipped: ${duplicatesSkipped}`);

            if (actualInserted === 1 && duplicatesSkipped === 2) {
                console.log(`✅ TEST PASSED: Only unique record inserted, duplicates properly skipped\n`);
            } else {
                console.log(`❌ TEST FAILED: Expected 1 insertion and 2 duplicates skipped\n`);
            }
        } catch (error) {
            console.log(`❌ Bulk insert failed: ${error.message}\n`);
            throw error;
        }

        // Test 4: Verify database state
        console.log('Test 4: Verifying database state...');
        const count = await JobApplicationResult.count({
            where: { userId: TEST_USER_ID }
        });
        console.log(`   Total records for test user: ${count}`);

        const uniqueUrls = await JobApplicationResult.count({
            where: { userId: TEST_USER_ID },
            distinct: true,
            col: 'companyUrl'
        });
        console.log(`   Unique company URLs: ${uniqueUrls}`);

        if (count === uniqueUrls) {
            console.log(`✅ TEST PASSED: All records have unique company URLs\n`);
        } else {
            console.log(`❌ TEST FAILED: Found duplicate company URLs!\n`);
        }

        // Cleanup - Only delete test records (those with test company URL)
        console.log('🧹 Cleaning up test data...');
        const deletedCount = await JobApplicationResult.destroy({
            where: {
                userId: TEST_USER_ID,
                companyUrl: [TEST_COMPANY_URL, TEST_COMPANY_URL + '-new']
            }
        });
        console.log(`✅ Test data cleaned up (${deletedCount} record(s) deleted)\n`);

        console.log('========================================================================');
        console.log('✅ ALL DEDUPLICATION TESTS PASSED');
        console.log('========================================================================\n');

    } catch (error) {
        console.error('\n❌ TEST SUITE FAILED');
        console.error(`Error: ${error.message}\n`);

        // Attempt cleanup even on failure
        try {
            // Get existing user ID if available
            const existingUser = await User.findOne();
            if (existingUser) {
                await JobApplicationResult.destroy({
                    where: {
                        userId: existingUser.id,
                        companyUrl: [TEST_COMPANY_URL, TEST_COMPANY_URL + '-new']
                    }
                });
            }
            console.log('✅ Cleanup completed\n');
        } catch (cleanupError) {
            console.error(`⚠️  Cleanup failed: ${cleanupError.message}\n`);
        }

        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run the test
testDeduplication();
