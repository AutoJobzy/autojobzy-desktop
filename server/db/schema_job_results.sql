-- ============================================================
-- JOB APPLICATION RESULTS TABLE SCHEMA
-- ============================================================
-- Stores job application results for each user's automation run
-- Normalized, indexed, and audit-ready
-- ============================================================

CREATE TABLE IF NOT EXISTS job_application_results (
    -- Primary Key
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Foreign Key (User Reference)
    user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,

    -- Job Processing Metadata
    datetime DATETIME NOT NULL,
    page_number TINYINT UNSIGNED NOT NULL,
    job_number VARCHAR(20) NOT NULL,  -- Example: "5/25"

    -- Job Details
    compny_url VARCHAaR(512) NOT NULL,

    -- Match Criteria (Stored as BOOLEAN for efficiency)
    early_applicant BOOLEAN DEFAULT FALSE,
    key_skills_match BOOLEAN DEFAULT FALSE,
    location_match BOOLEAN DEFAULT FALSE,
    experience_match BOOLEAN DEFAULT FALSE,

    -- Match Score (Store as integer for easy querying/filtering)
    match_score TINYINT UNSIGNED NOT NULL,  -- 0-5
    match_score_total TINYINT UNSIGNED DEFAULT 5,  -- Always 5, but kept for clarity

    -- Match Status
    match_status ENUM('Good Match', 'Poor Match') NOT NULL,

    -- Application Type
    apply_type ENUM('Direct Apply', 'External Apply', 'No Apply Button') NOT NULL,

    -- Audit Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for Performance
    INDEX idx_user_id (user_id),
    INDEX idx_datetime (datetime),
    INDEX idx_user_datetime (user_id, datetime),
    INDEX idx_match_score (match_score),
    INDEX idx_match_status (match_status),
    INDEX idx_apply_type (apply_type),

    -- Foreign Key Constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEXES EXPLANATION
-- ============================================================
-- idx_user_id: Fast lookups for user-specific results
-- idx_datetime: Time-based queries (recent applications, date ranges)
-- idx_user_datetime: Combined index for user's application history
-- idx_match_score: Filter jobs by match quality
-- idx_match_status: Quick filtering by good/poor matches
-- idx_apply_type: Analytics on application types

-- ============================================================
-- SAMPLE INSERT QUERY
-- ============================================================
INSERT INTO job_application_results (
    user_id,
    datetime,
    page_number,
    job_number,
    company_url,
    early_applicant,
    key_skills_match,
    location_match,
    experience_match,
    match_score,
    match_status,
    apply_type
) VALUES (
    '2170b0af-c5a0-4520-9949-e1e61b312ce1',
    '2025-12-20 14:30:45',
    1,
    '5/25',
    'https://www.naukri.com/job-listings-software-engineer-tcs-bangalore-3-to-5-years-201224501234',
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    3,
    'Good Match',
    'Direct Apply'
);

-- ============================================================
-- BULK INSERT EXAMPLE (Multiple rows)
-- ============================================================
INSERT INTO job_application_results (
    user_id, datetime, page_number, job_number, company_url,
    early_applicant, key_skills_match, location_match, experience_match,
    match_score, match_status, apply_type
) VALUES
    ('user-uuid-1', NOW(), 1, '1/25', 'https://example.com/job1', 1, 1, 0, 1, 3, 'Good Match', 'Direct Apply'),
    ('user-uuid-1', NOW(), 1, '2/25', 'https://example.com/job2', 0, 1, 1, 0, 2, 'Poor Match', 'External Apply'),
    ('user-uuid-1', NOW(), 1, '3/25', 'https://example.com/job3', 1, 1, 1, 1, 4, 'Good Match', 'Direct Apply');

-- ============================================================
-- USEFUL QUERIES
-- ============================================================

-- Get all results for a specific user
SELECT * FROM job_application_results
WHERE user_id = 'user-uuid-here'
ORDER BY datetime DESC;

-- Get good matches only
SELECT * FROM job_application_results
WHERE user_id = 'user-uuid-here' AND match_status = 'Good Match'
ORDER BY match_score DESC, datetime DESC;

-- Get statistics for user
SELECT
    COUNT(*) as total_jobs_processed,
    SUM(CASE WHEN match_status = 'Good Match' THEN 1 ELSE 0 END) as good_matches,
    SUM(CASE WHEN apply_type = 'Direct Apply' THEN 1 ELSE 0 END) as direct_applications,
    AVG(match_score) as avg_match_score
FROM job_application_results
WHERE user_id = 'user-uuid-here';

-- Get daily application count
SELECT
    DATE(datetime) as date,
    COUNT(*) as applications,
    AVG(match_score) as avg_score
FROM job_application_results
WHERE user_id = 'user-uuid-here'
GROUP BY DATE(datetime)
ORDER BY date DESC;
