-- ========================================================================
-- MIGRATION 009: Add Job Details Columns to job_application_results
-- ========================================================================
-- Purpose: Add comprehensive job details fields for better tracking and analytics
-- Idempotent: YES - Safe to run multiple times
-- Dependencies: Previous migrations
-- ========================================================================

USE jobautomate;

-- Add new columns to job_application_results table
ALTER TABLE job_application_results
ADD COLUMN IF NOT EXISTS job_title VARCHAR(255) DEFAULT NULL COMMENT 'Job title/position',
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) DEFAULT NULL COMMENT 'Company name',
ADD COLUMN IF NOT EXISTS experience_required VARCHAR(50) DEFAULT NULL COMMENT 'Experience requirement (e.g., "4-8 years")',
ADD COLUMN IF NOT EXISTS salary VARCHAR(100) DEFAULT NULL COMMENT 'Salary range or "Not Disclosed"',
ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL COMMENT 'Job location (city)',
ADD COLUMN IF NOT EXISTS posted_date VARCHAR(50) DEFAULT NULL COMMENT 'When job was posted (e.g., "1 week ago")',
ADD COLUMN IF NOT EXISTS openings VARCHAR(20) DEFAULT NULL COMMENT 'Number of openings',
ADD COLUMN IF NOT EXISTS applicants VARCHAR(20) DEFAULT NULL COMMENT 'Number of applicants',
ADD COLUMN IF NOT EXISTS key_skills TEXT DEFAULT NULL COMMENT 'Comma-separated list of key skills',
ADD COLUMN IF NOT EXISTS role VARCHAR(255) DEFAULT NULL COMMENT 'Job role category',
ADD COLUMN IF NOT EXISTS industry_type VARCHAR(255) DEFAULT NULL COMMENT 'Industry type',
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(100) DEFAULT NULL COMMENT 'Employment type (Full-time, Contract, etc.)',
ADD COLUMN IF NOT EXISTS role_category VARCHAR(255) DEFAULT NULL COMMENT 'Role category',
ADD COLUMN IF NOT EXISTS company_rating VARCHAR(10) DEFAULT NULL COMMENT 'Company rating (e.g., "4.0")',
ADD COLUMN IF NOT EXISTS job_highlights TEXT DEFAULT NULL COMMENT 'Job highlights (JSON array or text)';

-- Add indexes for commonly queried fields
ALTER TABLE job_application_results
ADD INDEX IF NOT EXISTS idx_job_title (job_title),
ADD INDEX IF NOT EXISTS idx_company_name (company_name),
ADD INDEX IF NOT EXISTS idx_location (location),
ADD INDEX IF NOT EXISTS idx_posted_date (posted_date);

-- Verify the changes
SELECT 'Job details columns added successfully' AS status;

-- Show new table structure
DESCRIBE job_application_results;

-- ========================================================================
-- END OF MIGRATION 009
-- ========================================================================
