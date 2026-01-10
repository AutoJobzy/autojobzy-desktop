-- ========================================================================
-- MIGRATION 010: Add Credential Verification Fields to job_settings
-- ========================================================================
-- MySQL Compatible Version
-- ========================================================================

USE jobautomate;

-- Add credential verification fields to job_settings table
DELIMITER $$

DROP PROCEDURE IF EXISTS AddCredentialVerificationFields$$

CREATE PROCEDURE AddCredentialVerificationFields()
BEGIN
    -- Check and add credentials_verified
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA='jobautomate'
                   AND TABLE_NAME='job_settings'
                   AND COLUMN_NAME='credentials_verified') THEN
        ALTER TABLE job_settings
        ADD COLUMN credentials_verified BOOLEAN DEFAULT FALSE NOT NULL
        COMMENT 'Whether Naukri credentials have been verified';
    END IF;

    -- Check and add last_verified
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA='jobautomate'
                   AND TABLE_NAME='job_settings'
                   AND COLUMN_NAME='last_verified') THEN
        ALTER TABLE job_settings
        ADD COLUMN last_verified DATETIME DEFAULT NULL
        COMMENT 'Timestamp of last successful verification';
    END IF;
END$$

DELIMITER ;

-- Execute the procedure
CALL AddCredentialVerificationFields();

-- Drop the procedure after use
DROP PROCEDURE IF EXISTS AddCredentialVerificationFields;

-- Verify the changes
SELECT 'Credential verification fields added successfully' AS status;

-- Show updated table structure
DESCRIBE job_settings;

-- ========================================================================
-- END OF MIGRATION 010
-- ========================================================================
