-- ============================================================================
-- SUPER ADMIN SYSTEM - DATABASE MIGRATION
-- Created: 2026-01-04
-- Description: Adds super admin, institutes, packages, and subscription system
-- ============================================================================

-- Step 1: Modify users table to add institute_id and update roles
ALTER TABLE `users`
ADD COLUMN `institute_id` CHAR(36) NULL AFTER `id`,
MODIFY COLUMN `role` ENUM('user', 'admin', 'superadmin', 'institute_admin', 'staff', 'student') NOT NULL DEFAULT 'user';

-- Step 2: Create institutes table
CREATE TABLE `institutes` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NULL,
  `address` TEXT NULL,
  `logo` VARCHAR(512) NULL,
  `website` VARCHAR(255) NULL,
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `created_by` CHAR(36) NULL COMMENT 'Super admin who created this institute',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Create packages table (subscription plans)
CREATE TABLE `packages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `student_limit` INT UNSIGNED NOT NULL COMMENT 'Maximum students allowed',
  `price_per_month` DECIMAL(10, 2) NOT NULL,
  `features` JSON NULL COMMENT 'Additional features as JSON',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Create institute_subscriptions table
CREATE TABLE `institute_subscriptions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `institute_id` CHAR(36) NOT NULL,
  `package_id` BIGINT UNSIGNED NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'pending',
  `payment_status` ENUM('paid', 'pending', 'failed') DEFAULT 'pending',
  `payment_date` DATETIME NULL,
  `payment_amount` DECIMAL(10, 2) NULL,
  `payment_reference` VARCHAR(255) NULL COMMENT 'Payment transaction ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_institute_id` (`institute_id`),
  INDEX `idx_package_id` (`package_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_status` (`payment_status`),
  FOREIGN KEY (`institute_id`) REFERENCES `institutes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Create institute_admins table (admins under institute)
CREATE TABLE `institute_admins` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `institute_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `permissions` JSON NULL COMMENT 'Admin permissions as JSON',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_institute_admin` (`institute_id`, `user_id`),
  INDEX `idx_institute_id` (`institute_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`institute_id`) REFERENCES `institutes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 6: Create institute_staff table
CREATE TABLE `institute_staff` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `institute_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `added_by` CHAR(36) NULL COMMENT 'Admin who added this staff',
  `role` VARCHAR(100) NULL COMMENT 'Staff role/designation',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_institute_staff` (`institute_id`, `user_id`),
  INDEX `idx_institute_id` (`institute_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_added_by` (`added_by`),
  FOREIGN KEY (`institute_id`) REFERENCES `institutes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 7: Create institute_students table
CREATE TABLE `institute_students` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `institute_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `added_by` CHAR(36) NULL COMMENT 'Admin who added this student',
  `enrollment_number` VARCHAR(100) NULL,
  `batch` VARCHAR(50) NULL,
  `course` VARCHAR(100) NULL,
  `status` ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_institute_student` (`institute_id`, `user_id`),
  INDEX `idx_institute_id` (`institute_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_added_by` (`added_by`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`institute_id`) REFERENCES `institutes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 8: Add foreign key for users.institute_id
ALTER TABLE `users`
ADD CONSTRAINT `fk_users_institute`
FOREIGN KEY (`institute_id`) REFERENCES `institutes`(`id`) ON DELETE SET NULL;

-- Step 9: Insert default super admin (update password after creation!)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`)
VALUES (
  UUID(),
  'Super Admin',
  'superadmin@jobautomation.com',
  '$2b$10$YourHashedPasswordHere', -- IMPORTANT: Update this with actual hashed password
  'superadmin',
  NOW(),
  NOW()
);

-- Step 10: Insert initial package (500 students, 60000 per month)
INSERT INTO `packages` (`name`, `description`, `student_limit`, `price_per_month`, `features`, `is_active`)
VALUES (
  'Basic Plan',
  'Perfect for small to medium institutes - 500 students',
  500,
  60000.00,
  JSON_OBJECT(
    'student_limit', 500,
    'job_automation', true,
    'resume_builder', true,
    'skill_tracking', true,
    'analytics', true,
    'support', 'Email & Phone'
  ),
  1
);

-- Step 11: Insert additional sample packages
INSERT INTO `packages` (`name`, `description`, `student_limit`, `price_per_month`, `features`, `is_active`)
VALUES
(
  'Standard Plan',
  'Great for growing institutes - 1000 students',
  1000,
  100000.00,
  JSON_OBJECT(
    'student_limit', 1000,
    'job_automation', true,
    'resume_builder', true,
    'skill_tracking', true,
    'analytics', true,
    'bulk_import', true,
    'support', '24/7 Support'
  ),
  1
),
(
  'Premium Plan',
  'For large institutes - 2500 students',
  2500,
  200000.00,
  JSON_OBJECT(
    'student_limit', 2500,
    'job_automation', true,
    'resume_builder', true,
    'skill_tracking', true,
    'analytics', true,
    'bulk_import', true,
    'api_access', true,
    'custom_branding', true,
    'dedicated_manager', true,
    'support', 'Priority 24/7 Support'
  ),
  1
);

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to verify)
-- ============================================================================

-- Check new columns in users table
-- SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users';

-- Check all new tables
-- SHOW TABLES LIKE 'institute%';
-- SHOW TABLES LIKE 'packages';

-- Verify super admin created
-- SELECT id, name, email, role FROM users WHERE role = 'superadmin';

-- Verify packages created
-- SELECT * FROM packages;

-- ============================================================================
-- ROLLBACK SCRIPT (Use only if needed to undo changes)
-- ============================================================================

-- DROP TABLE IF EXISTS `institute_students`;
-- DROP TABLE IF EXISTS `institute_staff`;
-- DROP TABLE IF EXISTS `institute_admins`;
-- DROP TABLE IF EXISTS `institute_subscriptions`;
-- DROP TABLE IF EXISTS `packages`;
-- DROP TABLE IF EXISTS `institutes`;
-- ALTER TABLE `users` DROP FOREIGN KEY `fk_users_institute`;
-- ALTER TABLE `users` DROP COLUMN `institute_id`;
-- ALTER TABLE `users` MODIFY COLUMN `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user';
-- DELETE FROM `users` WHERE `role` = 'superadmin';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
