-- ========================================================================
-- MIGRATION 004: Add Missing Filter Types
-- ========================================================================
-- Purpose: Add 'stipend' and 'internshipDuration' to filter_type ENUM
-- Idempotent: YES - Safe to run multiple times
-- Dependencies: 002_create_tables.sql
-- ========================================================================

USE jobautomate;

-- Step 1: Check current ENUM values
SELECT COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'jobautomate'
  AND TABLE_NAME = 'filter_options'
  AND COLUMN_NAME = 'filter_type';

-- Step 2: Alter ENUM to add new filter types
-- MySQL doesn't allow conditional ENUM modification, but re-running is safe
-- as long as we include all existing values

ALTER TABLE filter_options
MODIFY COLUMN filter_type ENUM(
    'salaryRange',
    'wfhType',
    'topGroupId',
    'stipend',
    'employement',
    'featuredCompanies',
    'business_size',
    'citiesGid',
    'functionalAreaGid',
    'internshipDuration',
    'ugCourseGid',
    'glbl_RoleCat',
    'pgCourseGid',
    'industryTypeGid'
) NOT NULL;

-- Step 3: Verify changes
SELECT COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'jobautomate'
  AND TABLE_NAME = 'filter_options'
  AND COLUMN_NAME = 'filter_type';

SELECT 'Filter types updated successfully' AS status;

-- ========================================================================
-- END OF MIGRATION 004
-- ========================================================================
