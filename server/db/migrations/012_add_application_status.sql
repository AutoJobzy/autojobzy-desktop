-- ========================================================================
-- MIGRATION 012: Add application_status column to job_application_results
-- ========================================================================
-- Purpose: Track whether job was Applied or Skipped during automation
-- Idempotent: YES - Safe to run multiple times
-- ========================================================================

USE jobautomate;

-- Add application_status column to job_application_results table (idempotent)
SET @dbname = 'jobautomate';
SET @tablename = 'job_application_results';
SET @columnname = 'application_status';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 'Column already exists, skipping' AS message;",
  "ALTER TABLE job_application_results ADD COLUMN application_status ENUM('Applied', 'Skipped') DEFAULT NULL COMMENT 'Status: Applied or Skipped during automation';"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verify column was added
SELECT 'application_status column added successfully to job_application_results table' AS status;

-- ========================================================================
-- END OF MIGRATION 012
-- ========================================================================
