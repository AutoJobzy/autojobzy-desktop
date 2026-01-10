-- ========================================================================
-- MIGRATION 009: Add Job Details Columns to job_application_results
-- ========================================================================
-- MySQL Compatible Version
-- ========================================================================

USE jobautomate;

-- Add new columns to job_application_results table
-- Using procedure to handle IF NOT EXISTS logic
DELIMITER $$

DROP PROCEDURE IF EXISTS AddJobDetailsColumns$$

CREATE PROCEDURE AddJobDetailsColumns()
BEGIN
    -- Check and add job_title
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='job_title') THEN
        ALTER TABLE job_application_results ADD COLUMN job_title VARCHAR(255) DEFAULT NULL COMMENT 'Job title/position';
    END IF;

    -- Check and add company_name
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='company_name') THEN
        ALTER TABLE job_application_results ADD COLUMN company_name VARCHAR(255) DEFAULT NULL COMMENT 'Company name';
    END IF;

    -- Check and add experience_required
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='experience_required') THEN
        ALTER TABLE job_application_results ADD COLUMN experience_required VARCHAR(50) DEFAULT NULL COMMENT 'Experience requirement (e.g., "4-8 years")';
    END IF;

    -- Check and add salary
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='salary') THEN
        ALTER TABLE job_application_results ADD COLUMN salary VARCHAR(100) DEFAULT NULL COMMENT 'Salary range or "Not Disclosed"';
    END IF;

    -- Check and add location
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='location') THEN
        ALTER TABLE job_application_results ADD COLUMN location VARCHAR(255) DEFAULT NULL COMMENT 'Job location (city)';
    END IF;

    -- Check and add posted_date
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='posted_date') THEN
        ALTER TABLE job_application_results ADD COLUMN posted_date VARCHAR(50) DEFAULT NULL COMMENT 'When job was posted (e.g., "1 week ago")';
    END IF;

    -- Check and add openings
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='openings') THEN
        ALTER TABLE job_application_results ADD COLUMN openings VARCHAR(20) DEFAULT NULL COMMENT 'Number of openings';
    END IF;

    -- Check and add applicants
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='applicants') THEN
        ALTER TABLE job_application_results ADD COLUMN applicants VARCHAR(20) DEFAULT NULL COMMENT 'Number of applicants';
    END IF;

    -- Check and add key_skills
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='key_skills') THEN
        ALTER TABLE job_application_results ADD COLUMN key_skills TEXT DEFAULT NULL COMMENT 'Comma-separated list of key skills';
    END IF;

    -- Check and add role
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='role') THEN
        ALTER TABLE job_application_results ADD COLUMN role VARCHAR(255) DEFAULT NULL COMMENT 'Job role category';
    END IF;

    -- Check and add industry_type
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='industry_type') THEN
        ALTER TABLE job_application_results ADD COLUMN industry_type VARCHAR(255) DEFAULT NULL COMMENT 'Industry type';
    END IF;

    -- Check and add employment_type
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='employment_type') THEN
        ALTER TABLE job_application_results ADD COLUMN employment_type VARCHAR(100) DEFAULT NULL COMMENT 'Employment type (Full-time, Contract, etc.)';
    END IF;

    -- Check and add role_category
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='role_category') THEN
        ALTER TABLE job_application_results ADD COLUMN role_category VARCHAR(255) DEFAULT NULL COMMENT 'Role category';
    END IF;

    -- Check and add company_rating
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='company_rating') THEN
        ALTER TABLE job_application_results ADD COLUMN company_rating VARCHAR(10) DEFAULT NULL COMMENT 'Company rating (e.g., "4.0")';
    END IF;

    -- Check and add job_highlights
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND COLUMN_NAME='job_highlights') THEN
        ALTER TABLE job_application_results ADD COLUMN job_highlights TEXT DEFAULT NULL COMMENT 'Job highlights (comma-separated)';
    END IF;
END$$

DELIMITER ;

-- Execute the procedure
CALL AddJobDetailsColumns();

-- Drop the procedure after use
DROP PROCEDURE IF EXISTS AddJobDetailsColumns;

-- Add indexes for commonly queried fields (safe approach)
DELIMITER $$

DROP PROCEDURE IF EXISTS AddJobDetailsIndexes$$

CREATE PROCEDURE AddJobDetailsIndexes()
BEGIN
    -- Add index on job_title if it doesn't exist
    IF NOT EXISTS (SELECT * FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND INDEX_NAME='idx_job_title') THEN
        ALTER TABLE job_application_results ADD INDEX idx_job_title (job_title);
    END IF;

    -- Add index on company_name if it doesn't exist
    IF NOT EXISTS (SELECT * FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND INDEX_NAME='idx_company_name') THEN
        ALTER TABLE job_application_results ADD INDEX idx_company_name (company_name);
    END IF;

    -- Add index on location if it doesn't exist
    IF NOT EXISTS (SELECT * FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND INDEX_NAME='idx_location') THEN
        ALTER TABLE job_application_results ADD INDEX idx_location (location);
    END IF;

    -- Add index on posted_date if it doesn't exist
    IF NOT EXISTS (SELECT * FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='jobautomate' AND TABLE_NAME='job_application_results' AND INDEX_NAME='idx_posted_date') THEN
        ALTER TABLE job_application_results ADD INDEX idx_posted_date (posted_date);
    END IF;
END$$

DELIMITER ;

-- Execute the index procedure
CALL AddJobDetailsIndexes();

-- Drop the procedure after use
DROP PROCEDURE IF EXISTS AddJobDetailsIndexes;

-- Verify the changes
SELECT 'Job details columns added successfully' AS status;

-- Show new table structure
DESCRIBE job_application_results;

-- ========================================================================
-- END OF MIGRATION 009
-- ========================================================================
