-- ========================================================================
-- MIGRATION 008: Create Suggestions and Discount Coupons Tables
-- ========================================================================
-- Purpose: Add Suggest & Earn feature tables
-- Idempotent: YES - Safe to run multiple times
-- ========================================================================

USE jobautomate;

-- ========================================================================
-- TABLE: suggestions
-- Purpose: Store user suggestions for features, bugs, UX improvements
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
-- TABLE: discount_coupons
-- Purpose: Store discount coupons generated as rewards
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
    subscription_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    generated_by CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (suggestion_id) REFERENCES suggestions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_suggestion_id (suggestion_id),
    INDEX idx_user_id (user_id),
    INDEX idx_code (code),
    INDEX idx_is_used (is_used),
    INDEX idx_is_active (is_active),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- TABLE CREATION SUMMARY
-- ========================================================================
SELECT 'Suggestions and coupons tables created successfully' AS status;

-- ========================================================================
-- END OF MIGRATION 008
-- ========================================================================
