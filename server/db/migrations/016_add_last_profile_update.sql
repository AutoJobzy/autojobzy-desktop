-- ========================================================================
-- MIGRATION 016: Add last_profile_update column to job_settings
-- ========================================================================
-- Purpose: Track when user's Naukri profile was last updated
-- Idempotent: YES (safe to run multiple times)
-- Dependencies: 002_create_tables.sql
-- Date: 2026-01-01
-- ========================================================================

USE jobautomate;

-- Step 1: Check if column already exists
SELECT 'Checking if last_profile_update column exists...' AS status;
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'job_settings'
    AND COLUMN_NAME = 'last_profile_update'
);

-- Step 2: Add column if it doesn't exist
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE job_settings ADD COLUMN last_profile_update DATETIME NULL DEFAULT NULL COMMENT "Timestamp of last Naukri profile update"',
    'SELECT "Column last_profile_update already exists, skipping" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Verify column was added
SELECT 'Verifying column...' AS status;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'job_settings'
AND COLUMN_NAME = 'last_profile_update';

SELECT 'Migration 016 complete!' AS status;

-- ========================================================================
-- ROLLBACK (if needed)
-- ========================================================================
-- To remove the column:
-- ALTER TABLE job_settings DROP COLUMN last_profile_update;
-- ========================================================================
-- END OF MIGRATION 016
-- ========================================================================
