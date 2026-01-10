/**
 * Create missing tables: expenses, filter_options, plan_features
 * Schemas aligned with current Sequelize models
 */

import sequelize from './config.js';

async function createMissingTables() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database\n');

        // 1. Create expenses table
        console.log('📄 Creating expenses table...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id CHAR(36) NOT NULL PRIMARY KEY,
                category ENUM('server', 'api', 'email', 'support', 'marketing', 'operations', 'miscellaneous') NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                date DATE NOT NULL,
                notes TEXT DEFAULT NULL,
                created_by VARCHAR(255) DEFAULT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ expenses table created\n');

        // 2. Create filter_options table (matching FilterOption model)
        console.log('📄 Creating filter_options table...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS filter_options (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filter_type ENUM(
                    'salaryRange',
                    'wfhType',
                    'topGroupId',
                    'stipend',
                    'employement',
                    'featuredCompanies',
                    'business_size',
                    'citiesGid',
                    'functionalAreaGid',
                    'internshipDuration',
                    'ugCourseGid',
                    'glbl_RoleCat',
                    'pgCourseGid',
                    'industryTypeGid'
                ) NOT NULL,
                option_id VARCHAR(50) NOT NULL,
                label VARCHAR(255) NOT NULL,
                count INT DEFAULT 0,
                url VARCHAR(500) DEFAULT NULL,
                sort_order INT DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_filter_type (filter_type),
                UNIQUE INDEX idx_filter_type_option (filter_type, option_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ filter_options table created\n');

        // 3. Create plan_features table (matching PlanFeature model)
        console.log('📄 Creating plan_features table...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS plan_features (
                id CHAR(36) NOT NULL PRIMARY KEY,
                plan_id CHAR(36) NOT NULL,
                feature_key VARCHAR(100) NOT NULL,
                feature_value VARCHAR(200) NOT NULL,
                feature_label VARCHAR(200) DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_plan_id (plan_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ plan_features table created\n');

        console.log('✅ All 3 tables created successfully!');
        console.log('\n📊 Summary:');
        console.log('   ✅ expenses - Expense tracking');
        console.log('   ✅ filter_options - Naukri filter options');
        console.log('   ✅ plan_features - Plan feature details');
        console.log('\nℹ️  Schemas aligned with Sequelize models');
        console.log('   Foreign key constraints omitted for RDS compatibility');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

createMissingTables();
