-- ========================================================================
-- MIGRATION 006: Update Plans Schema
-- ========================================================================
-- Purpose: Add is_popular, coming_soon, and subtitle fields to plans table
-- Idempotent: YES - Safe to run multiple times
-- Dependencies: 002_create_tables.sql
-- ========================================================================

USE jobautomate;

-- Step 1: Check current columns
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'jobautomate'
  AND TABLE_NAME = 'plans'
ORDER BY ORDINAL_POSITION;

-- Step 2: Add new columns if they don't exist
-- Add is_popular column
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'jobautomate'
      AND TABLE_NAME = 'plans'
      AND COLUMN_NAME = 'is_popular'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE plans ADD COLUMN is_popular TINYINT(1) DEFAULT 0 COMMENT "Mark as popular/recommended plan" AFTER is_active',
    'SELECT "Column is_popular already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add coming_soon column
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'jobautomate'
      AND TABLE_NAME = 'plans'
      AND COLUMN_NAME = 'coming_soon'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE plans ADD COLUMN coming_soon TINYINT(1) DEFAULT 0 COMMENT "Mark as coming soon plan (not purchasable)" AFTER is_popular',
    'SELECT "Column coming_soon already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add subtitle column
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'jobautomate'
      AND TABLE_NAME = 'plans'
      AND COLUMN_NAME = 'subtitle'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE plans ADD COLUMN subtitle VARCHAR(255) DEFAULT NULL COMMENT "Plan subtitle/tagline" AFTER description',
    'SELECT "Column subtitle already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Add index for is_popular
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = 'jobautomate'
      AND TABLE_NAME = 'plans'
      AND INDEX_NAME = 'idx_is_popular'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE plans ADD INDEX idx_is_popular (is_popular)',
    'SELECT "Index idx_is_popular already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Add index for coming_soon
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = 'jobautomate'
      AND TABLE_NAME = 'plans'
      AND INDEX_NAME = 'idx_coming_soon'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE plans ADD INDEX idx_coming_soon (coming_soon)',
    'SELECT "Index idx_coming_soon already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Verify changes
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'jobautomate'
  AND TABLE_NAME = 'plans'
  AND COLUMN_NAME IN ('is_popular', 'coming_soon', 'subtitle')
ORDER BY ORDINAL_POSITION;

SELECT 'Plans schema updated successfully' AS status;

-- ========================================================================
-- END OF MIGRATION 006
-- ========================================================================
