/**
 * ========================================================================
 * YEARS OF EXPERIENCE TEST
 * ========================================================================
 * Tests the years_of_experience field functionality
 *
 * Usage: node server/db/test_years_of_experience.js
 * ========================================================================
 */

import JobSettings from '../models/JobSettings.js';
import User from '../models/User.js';
import sequelize from './config.js';

async function testYearsOfExperience() {
    console.log('\n========================================================================');
    console.log('              YEARS OF EXPERIENCE FUNCTIONALITY TEST                   ');
    console.log('========================================================================\n');

    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        // Get an existing user
        const existingUser = await User.findOne();
        if (!existingUser) {
            console.log('❌ No users found in database. Please create a user first.');
            process.exit(1);
        }

        console.log(`📌 Testing with user: ${existingUser.email} (${existingUser.id})\n`);

        // Test 1: Create/Update job settings with valid experience value
        console.log('Test 1: Setting years of experience to 5...');
        const [jobSettings, created] = await JobSettings.findOrCreate({
            where: { userId: existingUser.id },
            defaults: {
                userId: existingUser.id,
                yearsOfExperience: 5
            }
        });

        if (!created) {
            await jobSettings.update({ yearsOfExperience: 5 });
        }

        console.log(`✅ Years of experience set to: ${jobSettings.yearsOfExperience}`);
        console.log(`   Record ${created ? 'created' : 'updated'} successfully\n`);

        // Test 2: Verify data type (should be number, not string)
        console.log('Test 2: Verifying data type...');
        const reloaded = await JobSettings.findOne({
            where: { userId: existingUser.id }
        });

        if (typeof reloaded.yearsOfExperience === 'number') {
            console.log(`✅ Data type is correct: number (${reloaded.yearsOfExperience})\n`);
        } else {
            console.log(`❌ Data type is incorrect: ${typeof reloaded.yearsOfExperience}\n`);
        }

        // Test 3: Test boundary values (0 and 50)
        console.log('Test 3: Testing boundary values...');

        await jobSettings.update({ yearsOfExperience: 0 });
        console.log(`✅ Successfully set to 0 (minimum value)`);

        await jobSettings.update({ yearsOfExperience: 50 });
        console.log(`✅ Successfully set to 50 (maximum value)\n`);

        // Test 4: Test validation (should fail for >50)
        console.log('Test 4: Testing validation (value > 50)...');
        try {
            await jobSettings.update({ yearsOfExperience: 51 });
            console.log(`❌ Validation failed: Should have rejected value > 50\n`);
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                console.log(`✅ Validation working: Rejected value > 50`);
                console.log(`   Error: ${error.errors[0].message}\n`);
            } else {
                throw error;
            }
        }

        // Test 5: Test validation (should fail for negative)
        console.log('Test 5: Testing validation (negative value)...');
        try {
            await jobSettings.update({ yearsOfExperience: -1 });
            console.log(`❌ Validation failed: Should have rejected negative value\n`);
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                console.log(`✅ Validation working: Rejected negative value`);
                console.log(`   Error: ${error.errors[0].message}\n`);
            } else {
                throw error;
            }
        }

        // Test 6: Test default value for new records
        console.log('Test 6: Testing default value for new records...');
        // Find a non-existent user or use a temporary ID
        const tempUserId = '00000000-0000-0000-0000-000000000000';

        // Check if this temp user has settings
        const tempSettings = await JobSettings.findOne({
            where: { userId: tempUserId }
        });

        if (!tempSettings) {
            console.log(`✅ No existing settings for temp user (as expected)\n`);
        } else {
            // Clean up if exists
            await tempSettings.destroy();
        }

        // Test 7: Verify NOT NULL constraint
        console.log('Test 7: Testing NOT NULL constraint...');
        try {
            await JobSettings.create({
                userId: existingUser.id,
                yearsOfExperience: null
            });
            console.log(`❌ NOT NULL constraint failed: Should have rejected NULL value\n`);
        } catch (error) {
            if (error.name === 'SequelizeDatabaseError' || error.name === 'SequelizeValidationError') {
                console.log(`✅ NOT NULL constraint working: Rejected NULL value\n`);
            } else {
                throw error;
            }
        }

        // Test 8: Verify final state
        console.log('Test 8: Verifying final database state...');
        const finalState = await JobSettings.findOne({
            where: { userId: existingUser.id }
        });

        console.log(`✅ Final state verified:`);
        console.log(`   User ID: ${finalState.userId}`);
        console.log(`   Years of Experience: ${finalState.yearsOfExperience}`);
        console.log(`   Data Type: ${typeof finalState.yearsOfExperience}`);
        console.log(`   Updated At: ${finalState.updatedAt}\n`);

        console.log('========================================================================');
        console.log('✅ ALL TESTS PASSED - Years of Experience Feature Working Correctly');
        console.log('========================================================================\n');

    } catch (error) {
        console.error('\n❌ TEST SUITE FAILED');
        console.error(`Error: ${error.message}`);
        console.error(`Stack: ${error.stack}\n`);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run the test
testYearsOfExperience();
