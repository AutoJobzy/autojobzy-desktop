-- ======================== UPDATE USERS TABLE ========================
-- Add new roles and instituteId field to users table

-- Step 1: Modify the role column to include new role types
ALTER TABLE users
MODIFY COLUMN role ENUM('user', 'admin', 'superadmin', 'institute_admin', 'staff', 'student')
NOT NULL DEFAULT 'user';

-- Step 2: Add instituteId column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS institute_id VARCHAR(36) NULL,
ADD CONSTRAINT fk_users_institute
  FOREIGN KEY (institute_id)
  REFERENCES institutes(id)
  ON DELETE SET NULL;

-- Step 3: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_institute_id ON users(institute_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
