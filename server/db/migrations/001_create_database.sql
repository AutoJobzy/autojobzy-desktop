-- ========================================================================
-- MIGRATION 001: Database Creation
-- ========================================================================
-- Purpose: Create the main database
-- Idempotent: YES - Safe to run multiple times
-- Author: System
-- Date: 2025-12-20
-- ========================================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS jobautomate
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Use the database
USE jobautomate;

-- Verify database was created
SELECT 'Database jobautomate created/verified successfully' AS status;

-- ========================================================================
-- END OF MIGRATION 001
-- ========================================================================
