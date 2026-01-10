/**
 * ======================== CREDENTIALS MANAGER ========================
 * Utility to fetch and store Naukri credentials.
 * Uses environment variables for credential management.
 */

import dotenv from 'dotenv';

dotenv.config();

// In-memory storage for runtime credentials (optional)
let runtimeCredentials = {
    email: null,
    password: null
};

/**
 * Get credentials from environment variables or runtime storage
 * @returns {Promise<{email: string, password: string}>}
 */
export async function getCredentials() {
    try {
        // First try runtime credentials (set via API)
        if (runtimeCredentials.email && runtimeCredentials.password) {
            console.log('✅ Credentials loaded from runtime storage');
            return {
                email: runtimeCredentials.email,
                password: runtimeCredentials.password
            };
        }

        // Fallback to environment variables
        const envEmail = process.env.NAUKRI_EMAIL;
        const envPassword = process.env.NAUKRI_PASSWORD;

        if (envEmail && envPassword) {
            console.log('✅ Credentials loaded from environment variables');
            return { email: envEmail, password: envPassword };
        }

        throw new Error('No Naukri credentials found. Please set up credentials first.');
    } catch (error) {
        console.error('❌ Error fetching credentials:', error.message);
        throw error;
    }
}

/**
 * Save credentials to runtime storage
 * @param {string} email - Naukri email/username
 * @param {string} password - Naukri password
 */
export async function saveCredentials(email, password) {
    try {
        runtimeCredentials.email = email;
        runtimeCredentials.password = password;
        console.log('✅ Credentials saved to runtime storage');
    } catch (error) {
        console.warn('⚠️  Could not save credentials:', error.message);
        throw error;
    }
}

/**
 * Clear saved credentials from runtime storage
 */
export async function clearCredentials() {
    try {
        runtimeCredentials.email = null;
        runtimeCredentials.password = null;
        console.log('✅ Credentials cleared from runtime storage');
    } catch (error) {
        console.warn('⚠️  Error clearing credentials:', error.message);
    }
}

/**
 * Check if credentials are available
 */
export async function hasCredentials() {
    try {
        return !!(
            (runtimeCredentials.email && runtimeCredentials.password) ||
            (process.env.NAUKRI_EMAIL && process.env.NAUKRI_PASSWORD)
        );
    } catch {
        return !!(process.env.NAUKRI_EMAIL && process.env.NAUKRI_PASSWORD);
    }
}
