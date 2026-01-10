/**
 * ======================== DATA RETRIEVER ========================
 * Manages tool execution and lazy-loads data from database
 * Caches data within session to avoid repeated DB queries
 */

import mysql from 'mysql2/promise';
import { executeTool } from './AgentTools.js';

class DataRetriever {
    constructor(userId, dbConfig) {
        this.userId = userId;
        this.dbConfig = dbConfig;

        // Cached data (lazy-loaded on first access)
        this.userAnswersData = null;
        this.skillsData = null;
        this.resumeText = null;

        // Track if data has been loaded
        this.dataLoaded = {
            profile: false,
            skills: false,
            resume: false
        };
    }

    /**
     * Execute a tool with lazy-loaded context
     * @param {string} toolName - Tool name
     * @param {object} args - Tool arguments
     * @returns {Promise<any>}
     */
    async executeTool(toolName, args) {
        // Load context if not already loaded
        await this.ensureContextLoaded();

        // Build context object
        const context = {
            userId: this.userId,
            userAnswersData: this.userAnswersData,
            skillsData: this.skillsData,
            resumeText: this.resumeText
        };

        // Execute the tool
        return await executeTool(toolName, args, context);
    }

    /**
     * Ensure all required data is loaded
     */
    async ensureContextLoaded() {
        // Load all data in parallel if not loaded
        const promises = [];

        if (!this.dataLoaded.profile) {
            promises.push(this.loadUserProfile());
        }
        if (!this.dataLoaded.skills) {
            promises.push(this.loadSkills());
        }
        if (!this.dataLoaded.resume) {
            promises.push(this.loadResumeText());
        }

        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }

    /**
     * Get full context (forces load if not loaded)
     * @returns {Promise<object>}
     */
    async getContext() {
        await this.ensureContextLoaded();

        return {
            userId: this.userId,
            userAnswersData: this.userAnswersData,
            skillsData: this.skillsData,
            resumeText: this.resumeText
        };
    }

    /**
     * Load user profile from job_settings table
     */
    async loadUserProfile() {
        if (this.dataLoaded.profile) {
            return this.userAnswersData;
        }

        try {
            const connection = await mysql.createConnection(this.dbConfig);

            const [rows] = await connection.execute(
                `SELECT
                    u.first_name, u.last_name, u.email,
                    js.naukri_email, js.target_role, js.location,
                    js.current_c_t_c AS currentCTC,
                    js.expected_c_t_c AS expectedCTC,
                    js.notice_period AS noticePeriod,
                    js.years_of_experience AS yearsOfExperience,
                    js.availability, js.dob
                FROM job_settings js
                JOIN users u ON js.user_id = u.id
                WHERE js.user_id = ?`,
                [this.userId]
            );

            await connection.end();

            if (rows.length > 0) {
                const row = rows[0];
                this.userAnswersData = {
                    name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
                    naukriEmail: row.naukri_email || row.email,
                    targetRole: row.target_role,
                    location: row.location,
                    currentCTC: row.currentCTC,
                    expectedCTC: row.expectedCTC,
                    noticePeriod: row.noticePeriod,
                    yearsOfExperience: row.yearsOfExperience,
                    availability: row.availability,
                    dob: row.dob
                };
            } else {
                this.userAnswersData = {};
            }

            this.dataLoaded.profile = true;
            console.log('[DataRetriever] User profile loaded');
            return this.userAnswersData;
        } catch (error) {
            console.error('[DataRetriever] Error loading user profile:', error.message);
            this.userAnswersData = {};
            this.dataLoaded.profile = true;
            return this.userAnswersData;
        }
    }

    /**
     * Load skills from skills table
     */
    async loadSkills() {
        if (this.dataLoaded.skills) {
            return this.skillsData;
        }

        try {
            const connection = await mysql.createConnection(this.dbConfig);

            const [rows] = await connection.execute(
                `SELECT skill_name, display_name, rating, out_of, experience
                FROM skills
                WHERE user_id = ?`,
                [this.userId]
            );

            await connection.end();

            this.skillsData = rows;
            this.dataLoaded.skills = true;
            console.log(`[DataRetriever] Loaded ${rows.length} skills`);
            return this.skillsData;
        } catch (error) {
            console.error('[DataRetriever] Error loading skills:', error.message);
            this.skillsData = [];
            this.dataLoaded.skills = true;
            return this.skillsData;
        }
    }

    /**
     * Load resume text from job_settings table
     */
    async loadResumeText() {
        if (this.dataLoaded.resume) {
            return this.resumeText;
        }

        try {
            const connection = await mysql.createConnection(this.dbConfig);

            const [rows] = await connection.execute(
                `SELECT resume_text FROM job_settings WHERE user_id = ?`,
                [this.userId]
            );

            await connection.end();

            if (rows.length > 0 && rows[0].resume_text) {
                this.resumeText = rows[0].resume_text;
            } else {
                this.resumeText = '';
            }

            this.dataLoaded.resume = true;
            console.log(`[DataRetriever] Resume text loaded (${this.resumeText.length} chars)`);
            return this.resumeText;
        } catch (error) {
            console.error('[DataRetriever] Error loading resume:', error.message);
            this.resumeText = '';
            this.dataLoaded.resume = true;
            return this.resumeText;
        }
    }

    /**
     * Clear all cached data
     */
    clearCache() {
        this.userAnswersData = null;
        this.skillsData = null;
        this.resumeText = null;
        this.dataLoaded = {
            profile: false,
            skills: false,
            resume: false
        };
    }
}

export default DataRetriever;
