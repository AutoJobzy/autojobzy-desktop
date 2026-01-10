-- ========================================================================
-- MIGRATION 003: Add UNIQUE Constraints
-- ========================================================================
-- Purpose: Add UNIQUE constraints for data deduplication
-- Idempotent: YES - Safe to run multiple times
-- Dependencies: 002_create_tables.sql
-- ========================================================================

USE jobautomate;

-- ========================================================================
-- CONSTRAINT: Unique company_url in job_application_results
-- Purpose: Prevent duplicate job applications to the same company
-- ========================================================================

-- Step 1: Remove existing duplicates (if any) before adding constraint
-- This ensures the constraint can be applied successfully
DELETE t1 FROM job_application_results t1
INNER JOIN job_application_results t2
WHERE
    t1.id > t2.id
    AND t1.company_url = t2.company_url;

-- Step 2: Check if constraint already exists
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = 'jobautomate'
    AND table_name = 'job_application_results'
    AND index_name = 'unique_company_url'
);

-- Step 3: Add UNIQUE constraint only if it doesn't exist
-- Using prepared statement for conditional execution
SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE job_application_results ADD UNIQUE KEY unique_company_url (company_url)',
    'SELECT "Constraint unique_company_url already exists, skipping" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================================================
-- WHY DATABASE-LEVEL VALIDATION IS MANDATORY
-- ========================================================================
-- 1. ACID Compliance: Database ensures atomicity - no race conditions
-- 2. Concurrency Safety: Multiple processes can't insert duplicates simultaneously
-- 3. Data Integrity: Constraint enforced even if application logic fails
-- 4. Performance: Index-based validation is faster than SELECT-before-INSERT
-- 5. Reliability: Works even if script crashes/restarts during execution
-- 6. Single Source of Truth: One place to enforce uniqueness rule
-- 7. Production Safety: No manual intervention needed for consistency
-- ========================================================================

-- ========================================================================
-- VERIFICATION
-- ========================================================================
SELECT
    'UNIQUE constraint verification' AS check_type,
    index_name,
    non_unique,
    column_name
FROM information_schema.statistics
WHERE table_schema = 'jobautomate'
AND table_name = 'job_application_results'
AND index_name = 'unique_company_url';

-- ========================================================================
-- END OF MIGRATION 003
-- ========================================================================
