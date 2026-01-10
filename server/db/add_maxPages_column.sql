-- Add maxPages column to job_settings table
-- This migration adds the user-configurable maxPages field

-- Check if column exists and add it if it doesn't
SET @dbname = DATABASE();
SET @tablename = 'job_settings';
SET @columnname = 'maxPages';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT ''Column already exists'' AS message;',
  'ALTER TABLE job_settings ADD COLUMN maxPages INT DEFAULT 5 COMMENT ''Maximum pages to process during automation'';'
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verify the column was added
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'job_settings'
AND COLUMN_NAME = 'maxPages';
