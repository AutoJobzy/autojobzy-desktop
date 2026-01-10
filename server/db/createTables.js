/**
 * Create all necessary tables
 */

import sequelize from './config.js';

async function createTables() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database\n');

        // Create job_settings table
        console.log('📄 Creating job_settings table...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS job_settings (
                id CHAR(36) NOT NULL PRIMARY KEY,
                user_id CHAR(36) NOT NULL,
                naukri_email VARCHAR(255) DEFAULT NULL,
                naukri_password VARCHAR(255) DEFAULT NULL,
                credentials_verified TINYINT(1) DEFAULT 0,
                last_verified DATETIME DEFAULT NULL,
                target_role VARCHAR(255) DEFAULT 'Software Engineer',
                location VARCHAR(255) DEFAULT 'Bangalore',
                current_c_t_c VARCHAR(255) DEFAULT NULL,
                expected_c_t_c VARCHAR(255) DEFAULT NULL,
                notice_period VARCHAR(255) DEFAULT 'Immediate',
                search_keywords TEXT DEFAULT NULL,
                max_pages INT DEFAULT 5,
                availability VARCHAR(255) DEFAULT 'Flexible',
                resume_file_name VARCHAR(255) DEFAULT NULL,
                resume_text LONGTEXT DEFAULT NULL,
                resume_score INT DEFAULT 0,
                years_of_experience VARCHAR(255) DEFAULT NULL,
                dob DATE DEFAULT NULL,
                scheduled_time DATETIME DEFAULT NULL,
                schedule_status ENUM('pending', 'completed', 'cancelled') DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_schedule_status (schedule_status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ job_settings created\n');

        // Create job_application_results table
        console.log('📄 Creating job_application_results table...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS job_application_results (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                user_id CHAR(36) NOT NULL,
                datetime DATETIME NOT NULL,
                page_number TINYINT UNSIGNED NOT NULL,
                job_number VARCHAR(20) NOT NULL,
                company_url VARCHAR(512) NOT NULL,
                early_applicant TINYINT(1) DEFAULT 0,
                key_skills_match TINYINT(1) DEFAULT 0,
                location_match TINYINT(1) DEFAULT 0,
                experience_match TINYINT(1) DEFAULT 0,
                match_score TINYINT UNSIGNED NOT NULL,
                match_score_total TINYINT UNSIGNED DEFAULT 5,
                match_status ENUM('Good Match', 'Poor Match') NOT NULL,
                apply_type ENUM('Direct Apply', 'External Apply', 'No Apply Button') NOT NULL,
                application_status ENUM('Applied', 'Skipped') DEFAULT NULL,
                job_title VARCHAR(255) DEFAULT NULL,
                company_name VARCHAR(255) DEFAULT NULL,
                experience_required VARCHAR(50) DEFAULT NULL,
                salary VARCHAR(100) DEFAULT NULL,
                location VARCHAR(255) DEFAULT NULL,
                posted_date VARCHAR(50) DEFAULT NULL,
                openings VARCHAR(20) DEFAULT NULL,
                applicants VARCHAR(20) DEFAULT NULL,
                key_skills TEXT DEFAULT NULL,
                role VARCHAR(255) DEFAULT NULL,
                industry_type VARCHAR(255) DEFAULT NULL,
                employment_type VARCHAR(100) DEFAULT NULL,
                role_category VARCHAR(255) DEFAULT NULL,
                company_rating VARCHAR(10) DEFAULT NULL,
                job_highlights TEXT DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_datetime (datetime),
                INDEX idx_match_status (match_status),
                INDEX idx_apply_type (apply_type),
                INDEX idx_application_status (application_status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ job_application_results created\n');

        // Create other necessary tables
        const tables = [
            'skills',
            'user_filters',
            'plans',
            'user_plans',
            'coupons',
            'suggestions'
        ];

        for (const table of tables) {
            console.log(`📄 Creating ${table} table...`);
            try {
                if (table === 'skills') {
                    await sequelize.query(`
                        CREATE TABLE IF NOT EXISTS skills (
                            id CHAR(36) NOT NULL PRIMARY KEY,
                            user_id CHAR(36) NOT NULL,
                            skill_name VARCHAR(255) NOT NULL,
                            years_of_experience VARCHAR(50) DEFAULT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                            INDEX idx_user_id (user_id)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                    `);
                } else if (table === 'user_filters') {
                    await sequelize.query(`
                        CREATE TABLE IF NOT EXISTS user_filters (
                            id CHAR(36) NOT NULL PRIMARY KEY,
                            user_id CHAR(36) NOT NULL,
                            final_url VARCHAR(2000) DEFAULT NULL,
                            selected_filters JSON DEFAULT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                            INDEX idx_user_id (user_id)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                    `);
                } else if (table === 'plans') {
                    await sequelize.query(`
                        CREATE TABLE IF NOT EXISTS plans (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(100) NOT NULL,
                            price DECIMAL(10,2) NOT NULL,
                            duration_days INT NOT NULL,
                            features JSON DEFAULT NULL,
                            is_active TINYINT(1) DEFAULT 1,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                    `);
                } else if (table === 'user_plans') {
                    await sequelize.query(`
                        CREATE TABLE IF NOT EXISTS user_plans (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            user_id CHAR(36) NOT NULL,
                            plan_id INT NOT NULL,
                            start_date DATETIME NOT NULL,
                            end_date DATETIME NOT NULL,
                            is_active TINYINT(1) DEFAULT 1,
                            payment_status VARCHAR(50) DEFAULT 'pending',
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
                            INDEX idx_user_id (user_id),
                            INDEX idx_plan_id (plan_id)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                    `);
                } else if (table === 'coupons') {
                    await sequelize.query(`
                        CREATE TABLE IF NOT EXISTS coupons (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            code VARCHAR(50) NOT NULL UNIQUE,
                            discount_percent INT NOT NULL,
                            valid_from DATETIME NOT NULL,
                            valid_until DATETIME NOT NULL,
                            is_active TINYINT(1) DEFAULT 1,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                    `);
                } else if (table === 'suggestions') {
                    await sequelize.query(`
                        CREATE TABLE IF NOT EXISTS suggestions (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            user_id CHAR(36) NOT NULL,
                            suggestion_text TEXT NOT NULL,
                            status VARCHAR(50) DEFAULT 'pending',
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                            INDEX idx_user_id (user_id)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                    `);
                }
                console.log(`✅ ${table} created`);
            } catch (error) {
                console.log(`⚠️  ${table} - ${error.message}`);
            }
        }

        console.log('\n✅ All tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

createTables();
