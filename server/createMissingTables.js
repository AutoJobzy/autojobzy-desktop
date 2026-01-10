/**
 * Create missing super admin tables
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createTables = async () => {
    try {
        console.log('🔧 Connecting to database...');

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'job_automation',
            port: process.env.DB_PORT || 3306,
            ssl: {
                rejectUnauthorized: false
            }
        });

        console.log('✅ Connected to database\n');

        // Create institute_admins table
        console.log('📝 Creating institute_admins table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS institute_admins (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                institute_id CHAR(36) NOT NULL,
                user_id CHAR(36) NOT NULL,
                permissions JSON NULL COMMENT 'Admin permissions as JSON',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_institute_admin (institute_id, user_id),
                INDEX idx_institute_id (institute_id),
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ institute_admins created');

        // Create institute_staff table
        console.log('📝 Creating institute_staff table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS institute_staff (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                institute_id CHAR(36) NOT NULL,
                user_id CHAR(36) NOT NULL,
                added_by CHAR(36) NULL COMMENT 'Admin who added this staff',
                role VARCHAR(100) NULL COMMENT 'Staff role/designation',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_institute_staff (institute_id, user_id),
                INDEX idx_institute_id (institute_id),
                INDEX idx_user_id (user_id),
                INDEX idx_added_by (added_by)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ institute_staff created');

        // Create institute_students table
        console.log('📝 Creating institute_students table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS institute_students (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                institute_id CHAR(36) NOT NULL,
                user_id CHAR(36) NOT NULL,
                added_by CHAR(36) NULL COMMENT 'Admin who added this student',
                enrollment_number VARCHAR(100) NULL,
                batch VARCHAR(50) NULL,
                course VARCHAR(100) NULL,
                status ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_institute_student (institute_id, user_id),
                INDEX idx_institute_id (institute_id),
                INDEX idx_user_id (user_id),
                INDEX idx_added_by (added_by),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ institute_students created');

        // Insert default packages if empty
        console.log('\n📦 Checking packages...');
        const [pkgCount] = await connection.execute('SELECT COUNT(*) as count FROM packages');
        if (pkgCount[0].count === 0) {
            console.log('📝 Inserting default packages...');
            await connection.execute(`
                INSERT INTO packages (name, description, student_limit, price_per_month, features, is_active)
                VALUES
                ('Basic Plan', 'Ideal for small colleges and training centers', 500, 60000.00, '{"job_automation": true, "resume_builder": true, "skill_tracking": true, "analytics": "basic", "support": "Email"}', true),
                ('Standard Plan', 'Perfect for medium-sized institutions', 1000, 100000.00, '{"job_automation": true, "resume_builder": true, "skill_tracking": true, "analytics": "advanced", "support": "Email & Phone", "custom_branding": true}', true),
                ('Premium Plan', 'Best for large universities and enterprises', 2000, 180000.00, '{"job_automation": true, "resume_builder": true, "skill_tracking": true, "analytics": "advanced", "support": "Email, Phone & WhatsApp", "custom_branding": true, "api_access": true, "dedicated_support": true}', true)
            `);
            console.log('✅ Default packages added');
        } else {
            console.log('✅ Packages already exist');
        }

        await connection.end();
        console.log('\n✅ All tables created successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Run: node server/createSuperAdmin.js');
        console.log('   2. Run: node server/testSuperAdminLogin.js');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createTables();
