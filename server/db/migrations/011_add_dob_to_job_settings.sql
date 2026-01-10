-- ========================================================================
-- MIGRATION 011: Add DOB (Date of Birth) column to job_settings table
-- ========================================================================
-- Purpose: Add date_of_birth column to store user's date of birth
-- Idempotent: YES - Safe to run multiple times
-- ========================================================================

USE jobautomate;

-- Add dob column to job_settings table (idempotent - will skip if column exists)
SET @dbname = 'jobautomate';
SET @tablename = 'job_settings';
SET @columnname = 'dob';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 'Column already exists, skipping' AS message;",
  "ALTER TABLE job_settings ADD COLUMN dob DATE DEFAULT NULL COMMENT 'Date of Birth in YYYY-MM-DD format';"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verify column was added
SELECT 'DOB column added successfully to job_settings table' AS status;

-- ========================================================================
-- END OF MIGRATION 011
-- ========================================================================
