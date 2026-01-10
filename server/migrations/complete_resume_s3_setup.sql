-- ============================================================================
-- COMPLETE RESUME S3 SETUP - SQL MIGRATION
-- ============================================================================
-- This file contains all database changes needed for S3 resume upload feature
-- Run this if you need to manually apply or verify the schema
--
-- Usage: mysql -u admin -p jobautomate < complete_resume_s3_setup.sql
-- ============================================================================

USE jobautomate;

-- Check current schema
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'jobautomate'
  AND TABLE_NAME = 'job_settings'
  AND COLUMN_NAME IN ('resume_file_name', 'resume_s3_url', 'resume_s3_key')
ORDER BY ORDINAL_POSITION;

-- ============================================================================
-- STEP 1: Add resume_file_name column (if not exists)
-- ============================================================================
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'jobautomate'
    AND TABLE_NAME = 'job_settings'
    AND COLUMN_NAME = 'resume_file_name'
);

SET @sql = IF(
    @col_exists = 0,
    'ALTER TABLE job_settings ADD COLUMN resume_file_name VARCHAR(255) NULL COMMENT "Original uploaded resume filename"',
    'SELECT "Column resume_file_name already exists" AS Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- STEP 2: Add resume_s3_url column (if not exists)
-- ============================================================================
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'jobautomate'
    AND TABLE_NAME = 'job_settings'
    AND COLUMN_NAME = 'resume_s3_url'
);

SET @sql = IF(
    @col_exists = 0,
    'ALTER TABLE job_settings ADD COLUMN resume_s3_url VARCHAR(500) NULL COMMENT "S3 URL of uploaded resume"',
    'SELECT "Column resume_s3_url already exists" AS Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- STEP 3: Add resume_s3_key column (if not exists)
-- ============================================================================
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'jobautomate'
    AND TABLE_NAME = 'job_settings'
    AND COLUMN_NAME = 'resume_s3_key'
);

SET @sql = IF(
    @col_exists = 0,
    'ALTER TABLE job_settings ADD COLUMN resume_s3_key VARCHAR(500) NULL COMMENT "S3 object key for resume file"',
    'SELECT "Column resume_s3_key already exists" AS Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- VERIFICATION: Show final schema
-- ============================================================================
SELECT '=== RESUME COLUMNS AFTER MIGRATION ===' AS Info;

SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'jobautomate'
  AND TABLE_NAME = 'job_settings'
  AND COLUMN_NAME IN ('resume_file_name', 'resume_s3_url', 'resume_s3_key')
ORDER BY ORDINAL_POSITION;

-- ============================================================================
-- DATA VERIFICATION: Check existing resume data
-- ============================================================================
SELECT '=== EXISTING RESUME DATA ===' AS Info;

SELECT
    id,
    user_id,
    resume_file_name,
    CASE
        WHEN resume_s3_url IS NOT NULL THEN CONCAT(LEFT(resume_s3_url, 50), '...')
        ELSE NULL
    END AS resume_s3_url_preview,
    CASE
        WHEN resume_s3_key IS NOT NULL THEN resume_s3_key
        ELSE NULL
    END AS resume_s3_key,
    created_at,
    updated_at
FROM job_settings
WHERE resume_file_name IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
SELECT 'Migration completed successfully!' AS Status;
SELECT 'Resume S3 columns are ready for use' AS Message;
SELECT 'All users can now upload resumes to S3 bucket: autojobzy-desktop-downloads' AS Info;
