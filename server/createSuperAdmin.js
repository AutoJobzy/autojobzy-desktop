/**
 * Create Super Admin User
 * Run: node server/createSuperAdmin.js
 */

import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const createSuperAdmin = async () => {
    try {
        console.log('🔧 Connecting to database...');

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'job_automation',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to database');

        // Check if super admin already exists
        const [existingUsers] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            ['admin@jobzy.com']
        );

        const email = 'admin@jobzy.com';
        const password = 'superadmin';
        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingUsers.length > 0) {
            // Update existing super admin
            console.log('📝 Updating existing super admin password...');

            await connection.execute(
                'UPDATE users SET password = ?, role = ? WHERE email = ?',
                [hashedPassword, 'superadmin', email]
            );

            console.log('✅ Super admin password updated!');
        } else {
            // Create new super admin
            console.log('➕ Creating new super admin...');

            const userId = uuidv4();
            await connection.execute(
                `INSERT INTO users (id, first_name, last_name, email, password, role, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [userId, 'Super', 'Admin', email, hashedPassword, 'superadmin']
            );

            console.log('✅ Super admin created!');
        }

        console.log('\n📧 Login Credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');

        await connection.end();
        console.log('\n✅ Done!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createSuperAdmin();
