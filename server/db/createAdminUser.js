/**
 * ========================================================================
 * CREATE ADMIN USER
 * ========================================================================
 * Creates the default admin user with properly hashed password
 *
 * Usage: node server/db/createAdminUser.js
 * ========================================================================
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import sequelize from './config.js';

async function createAdminUser() {
    console.log('\n========================================================================');
    console.log('                    CREATING ADMIN USER                                 ');
    console.log('========================================================================\n');

    try {
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        const adminEmail = 'admin@jobautomate.com';
        const adminPassword = 'Admin@123';

        // Check if admin already exists
        const [existingAdmin] = await sequelize.query(
            'SELECT id, email, role FROM users WHERE email = ?',
            { replacements: [adminEmail] }
        );

        if (existingAdmin && existingAdmin.length > 0) {
            console.log('⚠️  Admin user already exists!');
            console.log(`   Email: ${existingAdmin[0].email}`);
            console.log(`   Role: ${existingAdmin[0].role}\n`);

            // Ask if user wants to reset password
            console.log('🔄 Resetting admin password...\n');

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(adminPassword, salt);

            // Update password
            await sequelize.query(
                'UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?',
                { replacements: [passwordHash, adminEmail] }
            );

            console.log('✅ Admin password has been reset!');
        } else {
            console.log('📝 Creating new admin user...\n');

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(adminPassword, salt);

            // Create admin user
            await sequelize.query(`
                INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, {
                replacements: [
                    uuidv4(),
                    adminEmail,
                    passwordHash,
                    'Admin',
                    'User',
                    'admin',
                    1
                ]
            });

            console.log('✅ Admin user created successfully!');
        }

        console.log('\n========================================================================');
        console.log('📋 ADMIN CREDENTIALS');
        console.log('========================================================================');
        console.log(`Email:    ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('========================================================================');
        console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!\n');

        // Verify the user was created/updated
        const [adminUser] = await sequelize.query(
            'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE email = ?',
            { replacements: [adminEmail] }
        );

        console.log('✅ Verification:');
        console.log(`   User ID: ${adminUser[0].id}`);
        console.log(`   Email: ${adminUser[0].email}`);
        console.log(`   Name: ${adminUser[0].first_name} ${adminUser[0].last_name}`);
        console.log(`   Role: ${adminUser[0].role}`);
        console.log(`   Active: ${adminUser[0].is_active ? 'Yes' : 'No'}\n`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ADMIN USER CREATION FAILED');
        console.error(`Error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

createAdminUser();
