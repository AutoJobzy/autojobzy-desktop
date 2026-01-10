/**
 * ======================== API SERVICE UTILITY ========================
 * Centralized API communication with backend
 * Use this in your React components to talk to the automation server
 */

// Desktop app ALWAYS uses localhost backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Read auth token from localStorage (or another storage you use)
 */
function getToken() {
    try {
        return localStorage.getItem('token');
    } catch (e) {
        return null;
    }
}

/**
 * Generic API call handler with optional auth header
 * @param {string} endpoint
 * @param {string} method
 * @param {object|null} body
 * @param {boolean} includeAuth
 */
async function apiCall(endpoint, method = 'GET', body = null, includeAuth = true) {
    try {
        const headers = {};

        // If sending JSON body, set content-type
        if (body && !(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (includeAuth) {
            const token = getToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            method,
            headers,
        };

        if (body) {
            options.body = body instanceof FormData ? body : JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            // Try to parse error body
            let errText = `HTTP ${response.status}`;
            try {
                const errJson = await response.json();
                errText = errJson.error || JSON.stringify(errJson);
            } catch (e) {
                // ignore
            }
            throw new Error(errText);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

/**
 * Health check - verify backend is running
 */
export async function checkBackendHealth() {
    try {
        const result = await apiCall('/health');
        return { ok: true, ...result };
    } catch (error) {
        return { ok: false, error: error.message };
    }
}

/**
 * ======================== AUTOMATION ENDPOINTS ========================
 */

/**
 * Start job automation
 * @param {Object} options - Configuration
 * @param {string} options.jobUrl - Job search URL
 * @param {number} options.maxPages - Max pages to process
 * @param {string} options.resumeText - Resume content
 */
export async function startAutomation(options = {}) {
    return apiCall('/automation/start', 'POST', options);
}

/**
 * Run bot with full data loading from database
 * Loads user settings, resume, credentials, and job preferences
 * Launches Puppeteer with visible browser window
 * @param {Object} [options] - Configuration (optional)
 * @param {string} [options.jobUrl] - Job search URL (optional)
 * @param {number} [options.maxPages] - Max pages to process (default 5)
 * @param {string} [options.searchKeywords] - Job search keywords (optional)
 */
export async function runBot(options = {}) {
    return apiCall('/automation/run-bot', 'POST', options);
}


/**
 * Stop currently running automation
 */
export async function stopAutomation() {
    return apiCall('/automation/stop', 'POST');
}

/**
 * Get automation logs
 */
export async function getAutomationLogs() {
    return apiCall('/automation/logs', 'GET');
}

/**
 * Clear logs
 */
export async function clearLogs() {
    return apiCall('/automation/clear-logs', 'POST');
}

/**
 * Reset automation state (for stuck/error recovery)
 */
export async function resetAutomation() {
    return apiCall('/automation/reset', 'POST');
}

/**
 * Get automation status
 */
export async function getAutomationStatus() {
    return apiCall('/automation/status', 'GET');
}

/**
 * Run filter automation (autoFilter.js)
 * Launches Puppeteer with saved filters to search jobs on Naukri
 */
export async function runFilter() {
    return apiCall('/automation/run-filter', 'POST');
}

/**
 * Get filter automation logs
 */
export async function getFilterLogs() {
    return apiCall('/automation/filter-logs', 'GET');
}

/**
 * Stop filter automation
 */
export async function stopFilter() {
    return apiCall('/automation/stop-filter', 'POST');
}

/**
 * ======================== CREDENTIALS ENDPOINTS ========================
 */

/**
 * Save Naukri credentials securely
 * @param {string} email - Naukri email/username
 * @param {string} password - Naukri password
 */
export async function saveCredentials(email, password) {
    return apiCall('/credentials/set', 'POST', { email, password });
}

/**
 * Check if credentials are saved
 */
export async function checkCredentials() {
    return apiCall('/credentials/check', 'GET');
}

/**
 * Clear saved credentials
 */
export async function clearCredentials() {
    return apiCall('/credentials/clear', 'DELETE');
}

/**
 * ======================== RESUME ENDPOINTS ========================
 */

/**
 * Upload resume file
 * @param {File} file - Resume file (PDF, TXT, DOC)
 */
export async function uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);

    // backend expects the resume upload under /api/job-settings/resume and requires auth
    return apiCall('/job-settings/resume', 'POST', formData, true);
}

/**
 * Get stored resume text
 */
export async function getResumeText() {
    return apiCall('/job-settings/resume-text', 'GET');
}

/**
 * ======================== JOB SETTINGS ENDPOINTS ========================
 */

/**
 * Get current user's job settings
 */
export async function getJobSettings() {
    return apiCall('/job-settings', 'GET');
}

/**
 * Update current user's job settings
 * @param {Object} settings
 */
export async function updateJobSettings(settings = {}) {
    return apiCall('/job-settings', 'POST', settings);
}

/**
 * Get answers data used by AI answer generator
 */
export async function getAnswersData() {
    return apiCall('/job-settings/answers-data', 'GET');
}

/**
 * ======================== SKILLS ENDPOINTS ========================
 */

/**
 * Get all skills for the logged-in user
 */
export async function getSkills() {
    return apiCall('/skills', 'GET');
}

/**
 * Create or update a single skill
 * @param {Object} skillData - Skill data
 */
export async function saveSkill(skillData) {
    return apiCall('/skills', 'POST', skillData);
}

/**
 * Create or update multiple skills at once
 * @param {Array} skills - Array of skill objects
 */
export async function saveSkillsBulk(skills) {
    return apiCall('/skills/bulk', 'POST', { skills });
}

/**
 * Delete a specific skill
 * @param {string} skillId - Skill ID to delete
 */
export async function deleteSkill(skillId) {
    return apiCall(`/skills/${skillId}`, 'DELETE');
}

/**
 * Delete all skills for the user
 */
export async function deleteAllSkills() {
    return apiCall('/skills', 'DELETE');
}

/**
 * ======================== FILTERS ENDPOINTS ========================
 */

/**
 * Get all filter options (salary, location, industry, etc.)
 * Returns grouped filters for job search
 */
export async function getAllFilters() {
    return apiCall('/filters/all', 'GET', null, false);
}

/**
 * Get specific filter options by type
 * @param {string} filterType - Filter type (salaryRange, citiesGid, wfhType, etc.)
 */
export async function getFilterByType(filterType) {
    return apiCall(`/filters/${filterType}`, 'GET', null, false);
}

/**
 * Get user's saved filter selections
 */
export async function getUserFilters() {
    return apiCall('/filters/user', 'GET');
}

/**
 * Save user's filter selections
 * @param {Object} filters - Filter selections object
 */
export async function saveUserFilters(filters) {
    return apiCall('/filters/user', 'POST', filters);
}

/**
 * ======================== HELPER FUNCTIONS ========================
 */

/**
 * Poll logs until automation completes
 * @param {Function} onUpdate - Callback for each log update
 * @param {number} interval - Poll interval in ms (default 2000)
 */
export async function pollLogs(onUpdate, interval = 2000) {
    const pollInterval = setInterval(async () => {
        try {
            const { logs, isRunning } = await getAutomationLogs();
            onUpdate(logs);

            if (!isRunning && logs.length > 0) {
                clearInterval(pollInterval);
            }
        } catch (error) {
            clearInterval(pollInterval);
        }
    }, interval);

    return () => clearInterval(pollInterval);
}

/**
 * Start automation and wait for completion
 * @param {Object} options - Start options
 * @param {Function} onLogUpdate - Log update callback
 */
export async function startAndMonitorAutomation(options, onLogUpdate) {
    // Start automation
    const startResult = await startAutomation(options);

    if (!startResult.success) {
        throw new Error(startResult.error || 'Failed to start automation');
    }

    // Poll logs until complete
    const stopPolling = await pollLogs(onLogUpdate);

    // Wait a bit then stop polling
    return new Promise((resolve) => {
        setTimeout(() => {
            stopPolling();
            resolve(startResult);
        }, 1000);
    });
}

/**
 * Complete user onboarding
 * Marks the user's onboarding as completed in the database
 */
export async function completeOnboarding() {
    return await apiCall('/auth/complete-onboarding', 'POST');
}

/**
 * Get job application results with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Results per page (default: 20)
 */
export async function getJobResults(page = 1, limit = 20) {
    return await apiCall(`/job-results?page=${page}&limit=${limit}`, 'GET');
}

/**
 * Get dashboard statistics
 * Returns aggregated stats for the dashboard
 */
export async function getDashboardStats() {
    return await apiCall('/job-results/stats', 'GET');
}

/**
 * ======================== AUTH/VERIFICATION ENDPOINTS ========================
 */

/**
 * Verify Naukri credentials by attempting login
 * SECURITY: Only performs login check - no data scraping or job actions
 * @param {string} naukriUsername - Naukri email/username
 * @param {string} naukriPassword - Naukri password
 * @returns {Promise<{success: boolean, message: string, verified: boolean}>}
 */
export async function verifyNaukriCredentials(naukriUsername, naukriPassword) {
    return await apiCall('/auth/verify-naukri-credentials', 'POST', {
        naukriUsername,
        naukriPassword
    });
}

/**
 * ======================== SCHEDULER ENDPOINTS ========================
 */

/**
 * Schedule automation to run at a specific time
 * @param {Date|string} scheduledTime - When to run the automation
 * @returns {Promise<{success: boolean, message: string, scheduledTime: string}>}
 */
export async function scheduleAutomation(scheduledTime) {
    return await apiCall('/automation/schedule', 'POST', { scheduledTime });
}

/**
 * Cancel scheduled automation
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function cancelScheduledAutomation() {
    return await apiCall('/automation/cancel-schedule', 'POST');
}

/**
 * Get current schedule status
 * @returns {Promise<{success: boolean, hasSchedule: boolean, scheduledTime: string|null, status: string|null}>}
 */
export async function getScheduleStatus() {
    return await apiCall('/automation/schedule-status', 'GET');
}
