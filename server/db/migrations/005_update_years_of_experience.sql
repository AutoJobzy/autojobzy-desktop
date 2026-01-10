-- ========================================================================
-- MIGRATION 005: Update Years of Experience Column
-- ========================================================================
-- Purpose: Convert years_of_experience from VARCHAR to TINYINT
--          Make it NOT NULL with DEFAULT 0 for job search functionality
-- Idempotent: YES - Safe to run multiple times
-- Dependencies: 002_create_tables.sql
-- ========================================================================

USE jobautomate;

-- Step 1: Check current column type
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.columns
WHERE table_schema = 'jobautomate'
  AND table_name = 'job_settings'
  AND column_name = 'years_of_experience';

-- Step 2: Clean up invalid data (convert non-numeric to 0)
-- Extract numeric values, set NULL/invalid values to 0
UPDATE job_settings
SET years_of_experience = 0
WHERE years_of_experience IS NULL
   OR years_of_experience = ''
   OR years_of_experience REGEXP '[^0-9]';

-- Extract numeric part from strings like "5+", "3-5", etc.
UPDATE job_settings
SET years_of_experience = CAST(REGEXP_REPLACE(years_of_experience, '[^0-9]', '') AS UNSIGNED)
WHERE years_of_experience REGEXP '^[0-9]+';

-- Step 3: Alter column to TINYINT NOT NULL DEFAULT 0
-- TINYINT UNSIGNED supports 0-255 (sufficient for years of experience)
ALTER TABLE job_settings
MODIFY COLUMN years_of_experience TINYINT UNSIGNED NOT NULL DEFAULT 0
COMMENT 'Years of experience for job search filtering';

-- Step 4: Verify the change
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM information_schema.columns
WHERE table_schema = 'jobautomate'
  AND table_name = 'job_settings'
  AND column_name = 'years_of_experience';

SELECT 'Years of experience column updated successfully' AS status;

-- ========================================================================
-- END OF MIGRATION 005
-- ========================================================================
