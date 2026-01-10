-- ========================================================================
-- DEDUPLICATION: Add UNIQUE constraint on company_url
-- ========================================================================
-- Purpose: Prevent duplicate job applications to the same company URL
-- Table: job_application_results
-- Column: company_url
-- ========================================================================

-- Step 1: Remove any existing duplicates before adding constraint
-- (This ensures the constraint can be added successfully)

DELETE t1 FROM job_application_results t1
INNER JOIN job_application_results t2
WHERE
    t1.id > t2.id
    AND t1.company_url = t2.company_url;

-- Step 2: Add UNIQUE constraint on company_url
ALTER TABLE job_application_results
ADD UNIQUE KEY unique_company_url (company_url);

-- Step 3: Verify the constraint was added
SHOW INDEX FROM job_application_results WHERE Key_name = 'unique_company_url';

-- ========================================================================
-- WHY DATABASE-LEVEL VALIDATION IS MANDATORY:
-- ========================================================================
-- 1. ACID Compliance: Database ensures atomicity - no race conditions
-- 2. Concurrency Safety: Multiple processes can't insert duplicates simultaneously
-- 3. Data Integrity: Constraint enforced even if application logic fails
-- 4. Performance: Index-based validation is faster than SELECT-before-INSERT
-- 5. Reliability: Works even if script crashes/restarts during execution
-- 6. Single Source of Truth: One place to enforce uniqueness rule
-- ========================================================================
