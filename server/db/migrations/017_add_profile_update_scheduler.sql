-- Migration #017: Add Profile Update Scheduler Columns
-- Date: 2026-01-02
-- Description: Add columns to job_settings table for auto profile update scheduling

-- Add profile update scheduler columns
ALTER TABLE job_settings
ADD COLUMN IF NOT EXISTS profile_update_enabled BOOLEAN DEFAULT FALSE COMMENT 'Is auto profile update enabled';

ALTER TABLE job_settings
ADD COLUMN IF NOT EXISTS profile_update_frequency INT DEFAULT 1 COMMENT 'Update frequency in days (1 = daily, 2 = every 2 days, etc.)';

ALTER TABLE job_settings
ADD COLUMN IF NOT EXISTS profile_update_schedule_time TIME DEFAULT '09:00:00' COMMENT 'Time of day to run the update (HH:MM:SS)';

ALTER TABLE job_settings
ADD COLUMN IF NOT EXISTS profile_update_next_run DATETIME NULL COMMENT 'Next scheduled profile update time';

ALTER TABLE job_settings
ADD COLUMN IF NOT EXISTS profile_update_last_status VARCHAR(50) DEFAULT 'idle' COMMENT 'Last update status: idle, success, failed, scheduled';
