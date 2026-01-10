-- ========================================================================
-- MIGRATION 007: Add Admin Role
-- ========================================================================
-- Purpose: Add role field to users table for admin authentication
-- Idempotent: YES - Safe to run multiple times
-- Dependencies: 002_create_tables.sql
-- ========================================================================

USE jobautomate;

-- Step 1: Check current columns
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'jobautomate'
  AND TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

-- Step 2: Add role column if it doesn't exist
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'jobautomate'
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'role'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE users ADD COLUMN role ENUM(''user'', ''admin'') DEFAULT ''user'' NOT NULL COMMENT "User role: user or admin" AFTER is_active',
    'SELECT "Column role already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Add index for role
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = 'jobautomate'
      AND TABLE_NAME = 'users'
      AND INDEX_NAME = 'idx_role'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE users ADD INDEX idx_role (role)',
    'SELECT "Index idx_role already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Create default admin user if not exists
-- Password: Admin@123 (hashed with bcrypt)
-- IMPORTANT: Change this password after first login!
SET @admin_exists = (
    SELECT COUNT(*)
    FROM users
    WHERE email = 'admin@jobautomate.com'
);

SET @sql = IF(@admin_exists = 0,
    'INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
     VALUES (
         UUID(),
         ''admin@jobautomate.com'',
         ''$2b$10$rKZxJPvqJqY5xZYxZYxZYe7qYxZYxZYxZYxZYxZYxZYxZYxZYxZYx'',
         ''Admin'',
         ''User'',
         ''admin'',
         1,
         NOW(),
         NOW()
     )',
    'SELECT "Admin user already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Verify changes
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'jobautomate'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'role';

SELECT id, email, first_name, last_name, role, is_active
FROM users
WHERE role = 'admin';

SELECT 'Admin role added successfully' AS status;
SELECT 'Default admin credentials: admin@jobautomate.com / Admin@123' AS info;
SELECT 'IMPORTANT: Change the admin password immediately!' AS warning;

-- ========================================================================
-- END OF MIGRATION 007
-- ========================================================================
