-- ========================================================================
-- MIGRATION 002: Create All Tables
-- ========================================================================
-- Purpose: Create all application tables with PRIMARY KEYS
-- Idempotent: YES - Safe to run multiple times
-- Dependencies: 001_create_database.sql
-- ========================================================================

USE jobautomate;

-- ========================================================================
-- TABLE: users
-- Purpose: Store user authentication and profile data
-- ========================================================================
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) DEFAULT NULL,
    last_name VARCHAR(100) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- TABLE: job_settings
-- Purpose: Store user job preferences and automation settings
-- ========================================================================
CREATE TABLE IF NOT EXISTS job_settings (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    naukri_email VARCHAR(255) DEFAULT NULL,
    naukri_password VARCHAR(255) DEFAULT NULL,
    target_role VARCHAR(255) DEFAULT 'Software Engineer',
    location VARCHAR(255) DEFAULT 'Bangalore',
    current_c_t_c VARCHAR(255) DEFAULT NULL,
    expected_c_t_c VARCHAR(255) DEFAULT NULL,
    notice_period VARCHAR(255) DEFAULT 'Immediate',
    search_keywords TEXT DEFAULT NULL,
    max_pages INT DEFAULT 5 COMMENT 'Maximum pages to process during automation',
    availability VARCHAR(255) DEFAULT 'Flexible' COMMENT 'Face-to-face meeting availability',
    resume_file_name VARCHAR(255) DEFAULT NULL,
    resume_text LONGTEXT DEFAULT NULL COMMENT 'Extracted resume text for AI processing',
    resume_score INT DEFAULT 0,
    years_of_experience VARCHAR(255) DEFAULT NULL,
    scheduled_time DATETIME DEFAULT NULL,
    schedule_status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- TABLE: skills
-- Purpose: Store user skills for job matching
-- ========================================================================
CREATE TABLE IF NOT EXISTS skills (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) DEFAULT NULL,
    rating DECIMAL(3,1) DEFAULT 0.0,
    out_of INT DEFAULT 5,
    experience VARCHAR(50) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_skill_name (skill_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- TABLE: job_application_results
-- Purpose: Store job application history and results
-- NOTE: UNIQUE constraint on company_url added in migration 003
-- ========================================================================
CREATE TABLE IF NOT EXISTS job_application_results (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_datetime (datetime),
    INDEX idx_match_score (match_score),
    INDEX idx_match_status (match_status),
    INDEX idx_apply_type (apply_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- TABLE: plans
-- Purpose: Store subscription plans
-- ========================================================================
CREATE TABLE IF NOT EXISTS plans (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    duration_days INT NOT NULL,
    applications_limit INT DEFAULT NULL COMMENT 'NULL = unlimited',
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- TABLE: plan_features
-- Purpose: Store features for each plan
-- ========================================================================
CREATE TABLE IF NOT EXISTS plan_features (
    id CHAR(36) NOT NULL PRIMARY KEY,
    plan_id CHAR(36) NOT NULL,
    feature_text VARCHAR(255) NOT NULL,
    feature_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    INDEX idx_plan_id (plan_id),
    INDEX idx_feature_order (feature_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- TABLE: user_subscriptions
-- Purpose: Store user subscription records
-- ========================================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    plan_id CHAR(36) NOT NULL,
    payment_id VARCHAR(255) DEFAULT NULL,
    order_id VARCHAR(255) DEFAULT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('pending', 'active', 'expired', 'cancelled') NOT NULL DEFAULT 'pending',
    start_date DATETIME DEFAULT NULL,
    end_date DATETIME DEFAULT NULL,
    applications_used INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- TABLE: filter_options
-- Purpose: Store job filter options for search
-- ========================================================================
CREATE TABLE IF NOT EXISTS filter_options (
    id CHAR(36) NOT NULL PRIMARY KEY,
    filter_type VARCHAR(50) NOT NULL,
    filter_id VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_filter_type (filter_type),
    INDEX idx_filter_id (filter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- TABLE: user_filters
-- Purpose: Store user's saved job search filters
-- ========================================================================
CREATE TABLE IF NOT EXISTS user_filters (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    freshness VARCHAR(50) DEFAULT NULL,
    salary_range TEXT DEFAULT NULL,
    wfh_type TEXT DEFAULT NULL,
    cities_gid TEXT DEFAULT NULL,
    functional_area_gid TEXT DEFAULT NULL,
    industry_type_gid TEXT DEFAULT NULL,
    ug_course_gid TEXT DEFAULT NULL,
    pg_course_gid TEXT DEFAULT NULL,
    business_size TEXT DEFAULT NULL,
    employement TEXT DEFAULT NULL,
    glbl_role_cat TEXT DEFAULT NULL,
    top_group_id TEXT DEFAULT NULL,
    featured_companies TEXT DEFAULT NULL,
    final_url TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_filter (user_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- TABLE CREATION SUMMARY
-- ========================================================================
SELECT 'All tables created/verified successfully' AS status;
SELECT COUNT(*) AS total_tables FROM information_schema.tables
WHERE table_schema = 'jobautomate' AND table_type = 'BASE TABLE';

-- ========================================================================
-- END OF MIGRATION 002
-- ========================================================================
