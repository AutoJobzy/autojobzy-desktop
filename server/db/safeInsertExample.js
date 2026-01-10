/**
 * ========================================================================
 * SAFE INSERT IMPLEMENTATION - Deduplication Strategy
 * ========================================================================
 *
 * APPROACH COMPARISON:
 *
 * 1. INSERT IGNORE
 *    - Silently skips duplicate records
 *    - Returns affected rows = 0 for duplicates
 *    - Pros: Simple, fast, no error thrown
 *    - Cons: Hard to track what was skipped
 *    - Use when: You don't need to know if record was duplicate
 *
 * 2. INSERT ... ON DUPLICATE KEY UPDATE ⭐ RECOMMENDED
 *    - Updates existing record instead of inserting
 *    - Can track insert vs update via affected rows
 *    - Pros: Full control, can update timestamps, better logging
 *    - Cons: Slightly more complex
 *    - Use when: You want to track duplicates or update existing records
 *
 * 3. Try-Catch with ER_DUP_ENTRY
 *    - Attempts insert, catches duplicate error
 *    - Provides detailed error information
 *    - Pros: Explicit handling, best for logging
 *    - Cons: Slower (exception overhead)
 *    - Use when: You need detailed duplicate tracking
 *
 * WINNER: INSERT ... ON DUPLICATE KEY UPDATE + Try-Catch
 * Reason: Best balance of safety, performance, and observability
 * ========================================================================
 */

import mysql from 'mysql2/promise';

// ========================================================================
// METHOD 1: INSERT ... ON DUPLICATE KEY UPDATE (RECOMMENDED)
// ========================================================================
export async function safeInsertJobResult_Method1(connection, jobData) {
    const query = `
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
            match_score_total,
            match_status,
            apply_type,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
            updated_at = NOW(),
            datetime = VALUES(datetime),
            page_number = VALUES(page_number);
    `;

    try {
        const [result] = await connection.execute(query, [
            jobData.userId,
            jobData.datetime,
            jobData.pageNumber,
            jobData.jobNumber,
            jobData.companyUrl,
            jobData.earlyApplicant,
            jobData.keySkillsMatch,
            jobData.locationMatch,
            jobData.experienceMatch,
            jobData.matchScore,
            jobData.matchScoreTotal,
            jobData.matchStatus,
            jobData.applyType
        ]);

        // Check if it was an INSERT (1) or UPDATE (2)
        if (result.affectedRows === 1) {
            console.log(`✅ New record inserted: ${jobData.companyUrl}`);
            return { success: true, inserted: true, duplicate: false };
        } else if (result.affectedRows === 2) {
            console.log(`⚠️  Duplicate company_url detected, record updated: ${jobData.companyUrl}`);
            return { success: true, inserted: false, duplicate: true };
        }
    } catch (error) {
        console.error(`❌ Failed to insert job result: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// ========================================================================
// METHOD 2: INSERT IGNORE (SIMPLE)
// ========================================================================
export async function safeInsertJobResult_Method2(connection, jobData) {
    const query = `
        INSERT IGNORE INTO job_application_results (
            user_id, datetime, page_number, job_number, company_url,
            early_applicant, key_skills_match, location_match,
            experience_match, match_score, match_score_total,
            match_status, apply_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    try {
        const [result] = await connection.execute(query, [
            jobData.userId,
            jobData.datetime,
            jobData.pageNumber,
            jobData.jobNumber,
            jobData.companyUrl,
            jobData.earlyApplicant,
            jobData.keySkillsMatch,
            jobData.locationMatch,
            jobData.experienceMatch,
            jobData.matchScore,
            jobData.matchScoreTotal,
            jobData.matchStatus,
            jobData.applyType
        ]);

        if (result.affectedRows === 0) {
            console.log(`⚠️  Duplicate company_url detected, skipping: ${jobData.companyUrl}`);
            return { success: true, inserted: false, duplicate: true };
        } else {
            console.log(`✅ New record inserted: ${jobData.companyUrl}`);
            return { success: true, inserted: true, duplicate: false };
        }
    } catch (error) {
        console.error(`❌ Failed to insert job result: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// ========================================================================
// METHOD 3: Try-Catch with Explicit Error Handling (BEST FOR LOGGING)
// ========================================================================
export async function safeInsertJobResult_Method3(connection, jobData) {
    const query = `
        INSERT INTO job_application_results (
            user_id, datetime, page_number, job_number, company_url,
            early_applicant, key_skills_match, location_match,
            experience_match, match_score, match_score_total,
            match_status, apply_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    try {
        const [result] = await connection.execute(query, [
            jobData.userId,
            jobData.datetime,
            jobData.pageNumber,
            jobData.jobNumber,
            jobData.companyUrl,
            jobData.earlyApplicant,
            jobData.keySkillsMatch,
            jobData.locationMatch,
            jobData.experienceMatch,
            jobData.matchScore,
            jobData.matchScoreTotal,
            jobData.matchStatus,
            jobData.applyType
        ]);

        console.log(`✅ New record inserted: ${jobData.companyUrl}`);
        return { success: true, inserted: true, duplicate: false };

    } catch (error) {
        // MySQL Duplicate Entry Error Code: ER_DUP_ENTRY (1062)
        if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️  Duplicate company_url detected, skipping record: ${jobData.companyUrl}`);
            console.log(`   Previous application exists for this company.`);
            return { success: true, inserted: false, duplicate: true };
        }

        // Other database errors
        console.error(`❌ Database error while inserting job result: ${error.message}`);
        console.error(`   Company URL: ${jobData.companyUrl}`);
        return { success: false, error: error.message };
    }
}

// ========================================================================
// USAGE EXAMPLE
// ========================================================================
async function exampleUsage() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root@123',
        database: 'jobautomate'
    });

    const jobData = {
        userId: 'user-123',
        datetime: new Date().toISOString(),
        pageNumber: 1,
        jobNumber: 'JOB001',
        companyUrl: 'https://example.com/job/12345',
        earlyApplicant: 1,
        keySkillsMatch: 1,
        locationMatch: 1,
        experienceMatch: 0,
        matchScore: 4,
        matchScoreTotal: 5,
        matchStatus: 'Good Match',
        applyType: 'Direct Apply'
    };

    // Use Method 1 (RECOMMENDED)
    const result = await safeInsertJobResult_Method1(connection, jobData);

    if (result.duplicate) {
        console.log('This job was already processed, continuing to next...');
    }

    await connection.end();
}

// ========================================================================
// RETRY SAFETY GUARANTEE
// ========================================================================
// With UNIQUE constraint + any of the above methods:
// 1. First run: Inserts all unique records
// 2. Retry/crash recovery: Skips already inserted records
// 3. Concurrent runs: Database prevents race conditions
// 4. Data integrity: 100% guaranteed - no duplicates possible
// ========================================================================
