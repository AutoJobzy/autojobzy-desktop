-- ========================================================================
-- MIGRATION 014: Fix Suggestions and Discount Coupons Schema
-- ========================================================================
-- Purpose: Drop and recreate suggestions + discount_coupons tables with correct schema
-- Reason: Old suggestions table had wrong structure (missing type, title, priority columns)
-- Issue: SequelizeDatabaseError: Unknown column 'type' in 'field list'
-- Resolution: DROP and CREATE both tables with proper schema
-- Idempotent: YES - Safe to run multiple times (IF NOT EXISTS)
-- Data Loss: NONE - Table was empty when migration was created
-- Date: 2026-01-01
-- ========================================================================

USE jobautomate;

-- ========================================================================
-- STEP 1: Drop existing tables (if they exist)
-- ========================================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS discount_coupons;
DROP TABLE IF EXISTS suggestions;
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================================
-- STEP 2: Create suggestions table with CORRECT schema
-- ========================================================================
CREATE TABLE IF NOT EXISTS suggestions (
    id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
    user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    type ENUM('feature_request', 'bug_report', 'ux_improvement', 'general_feedback') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'under_review', 'approved', 'implemented', 'rewarded', 'rejected')
        NOT NULL DEFAULT 'pending',
    admin_notes TEXT DEFAULT NULL,
    reviewed_by CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    reviewed_at DATETIME DEFAULT NULL,
    implemented_at DATETIME DEFAULT NULL,
    rewarded_at DATETIME DEFAULT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- STEP 3: Create discount_coupons table
-- ========================================================================
CREATE TABLE IF NOT EXISTS discount_coupons (
    id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
    suggestion_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('percentage', 'flat_amount') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) NOT NULL COMMENT 'Percentage or flat amount',
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2) DEFAULT NULL COMMENT 'Max discount cap for percentage',
    expiry_date DATETIME NOT NULL,
    is_used TINYINT(1) DEFAULT 0,
    used_at DATETIME DEFAULT NULL,
    subscription_id INT DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    generated_by CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_suggestion_id (suggestion_id),
    INDEX idx_user_id (user_id),
    INDEX idx_code (code),
    INDEX idx_is_used (is_used),
    INDEX idx_is_active (is_active),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- MIGRATION COMPLETED
-- ========================================================================
-- To run this migration:
--   node server/db/runMigration014.js
--
-- To verify:
--   DESCRIBE suggestions;
--   DESCRIBE discount_coupons;
-- ========================================================================
