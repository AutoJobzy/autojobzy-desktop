-- ========================================================================
-- MIGRATION 015: Add UNIQUE constraint on user_id in user_filters
-- ========================================================================
-- Purpose: Ensure one user can only have one set of filter preferences
-- Idempotent: YES (safe to run multiple times)
-- Dependencies: 002_create_tables.sql
-- Date: 2026-01-01
-- ========================================================================

USE jobautomate;

-- Step 1: Check for duplicate user_id values
SELECT 'Checking for duplicates...' AS status;
SELECT user_id, COUNT(*) as count
FROM user_filters
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Step 2: Clean up duplicates (keep most recent)
-- Note: This is for reference. Use the JavaScript migration for automatic cleanup.
-- Example (replace 'duplicate-user-id' with actual user_id from Step 1):
/*
DELETE FROM user_filters
WHERE user_id = 'duplicate-user-id'
AND id NOT IN (
    SELECT id FROM (
        SELECT id
        FROM user_filters
        WHERE user_id = 'duplicate-user-id'
        ORDER BY updated_at DESC
        LIMIT 1
    ) as keeper
);
*/

-- Step 3: Check if UNIQUE constraint already exists
SELECT 'Checking if constraint exists...' AS status;
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user_filters'
    AND CONSTRAINT_NAME = 'unique_user_id'
);

-- Step 4: Add UNIQUE constraint if it doesn't exist
SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE user_filters ADD CONSTRAINT unique_user_id UNIQUE (user_id)',
    'SELECT "UNIQUE constraint already exists, skipping" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Verify constraint was added
SELECT 'Verifying constraint...' AS status;
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'user_filters'
AND CONSTRAINT_NAME = 'unique_user_id';

-- Step 6: Verify unique index exists
SELECT 'Verifying indexes on user_id...' AS status;
SELECT INDEX_NAME, NON_UNIQUE, COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'user_filters'
AND COLUMN_NAME = 'user_id';

-- Expected result: Should show unique_user_id index with NON_UNIQUE = 0

SELECT 'Migration 015 complete!' AS status;

-- ========================================================================
-- ROLLBACK (if needed)
-- ========================================================================
-- To remove the UNIQUE constraint:
-- ALTER TABLE user_filters DROP CONSTRAINT unique_user_id;
-- ========================================================================
-- END OF MIGRATION 015
-- ========================================================================
