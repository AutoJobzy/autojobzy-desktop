/**
 * ======================== NAUKRI CREDENTIAL VERIFICATION ========================
 * Securely verify Naukri account credentials by attempting login
 * IMPORTANT: This script ONLY verifies login - no data scraping or job actions
 * ==================================================================================
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import { launchBrowser } from './utils/puppeteerHelper.js';

/**
 * Verify Naukri credentials by attempting login
 * @param {string} username - Naukri username/email
 * @param {string} password - Naukri password
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function verifyNaukriCredentials(username, password) {
    let browser = null;

    try {
        console.log('[VERIFY] Starting Naukri credential verification...');

        // Validate inputs
        if (!username || !password) {
            return {
                success: false,
                message: 'Username and password are required'
            };
        }

        // Browser configuration
        const browserConfig = {
            headless: 'new', // Use new headless mode
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-blink-features=AutomationControlled',
                '--disable-gpu',
                '--window-size=1920,1080'
            ],
            defaultViewport: null
        };

        // Launch browser with automatic Chrome detection
        browser = await launchBrowser(browserConfig);

        const page = await browser.newPage();

        // Set user agent to avoid detection
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        );

        // Set viewport
        await page.setViewport({ width: 1280, height: 720 });

        console.log('[VERIFY] Navigating to Naukri login page...');

        // Navigate to Naukri login page with increased timeout
        await page.goto('https://www.naukri.com/nlogin/login', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        console.log('[VERIFY] Waiting for login form...');

        // Wait for login form to be visible with increased timeout
        await page.waitForSelector('#usernameField', { timeout: 20000 });

        console.log('[VERIFY] Entering credentials... (credentials are NOT logged)');

        // Fill in username
        await page.type('#usernameField', username, { delay: 100 });

        // Fill in password
        await page.type('#passwordField', password, { delay: 100 });

        console.log('[VERIFY] Submitting login form...');

        // Click login button
        await page.click('button[type="submit"]');

        // Wait for navigation or error message with increased timeout
        await Promise.race([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
            page.waitForSelector('.error', { timeout: 30000 })
        ]).catch(() => {
            // Timeout is okay, we'll check the page state
        });

        // Wait for the page to stabilize
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check if we're still on the login page or if there's an error
        const currentUrl = page.url();
        console.log('[VERIFY] Current URL after login attempt:', currentUrl);

        // Check for error messages
        const errorMessage = await page.evaluate(() => {
            const errorElement = document.querySelector('.error, .err-txt, [class*="error"]');
            return errorElement ? errorElement.textContent.trim() : null;
        });

        // Check if login was successful by looking for profile indicators
        const isLoggedIn = await page.evaluate(() => {
            // Check for common indicators of successful login
            const profileButton = document.querySelector('[class*="profile"], [class*="logout"], .nI-gNb-drawer__icon');
            const loginForm = document.querySelector('#usernameField');

            // If we can still see the login form, login failed
            if (loginForm) {
                return false;
            }

            // If we see profile/logout button, login succeeded
            if (profileButton) {
                return true;
            }

            return false;
        });

        // Alternative check: URL changed away from login page
        const urlChanged = !currentUrl.includes('/nlogin/login');

        if (errorMessage) {
            console.log('[VERIFY] Login failed - Error message found:', errorMessage);
            return {
                success: false,
                message: 'Invalid credentials. Please check your username or password.'
            };
        }

        if (isLoggedIn || urlChanged) {
            console.log('[VERIFY] ✓ Credentials verified successfully!');
            return {
                success: true,
                message: 'Credentials verified successfully!'
            };
        }

        // If we're still on login page without error, assume invalid credentials
        console.log('[VERIFY] Login failed - Still on login page');
        return {
            success: false,
            message: 'Unable to verify credentials. Please check your username or password.'
        };

    } catch (error) {
        console.error('[VERIFY] Verification error:', error.message);

        // Return user-friendly error message
        if (error.message.includes('timeout')) {
            return {
                success: false,
                message: 'Verification timed out. Please check your internet connection and try again.'
            };
        }

        return {
            success: false,
            message: 'Verification failed due to a technical error. Please try again later.'
        };
    } finally {
        // Always close browser to free resources
        if (browser) {
            try {
                await browser.close();
                console.log('[VERIFY] Browser closed');
            } catch (closeError) {
                console.error('[VERIFY] Error closing browser:', closeError.message);
            }
        }
    }
}

/**
 * SECURITY NOTES:
 * - Credentials are NEVER logged or stored by this script
 * - Browser runs in headless mode
 * - All resources are cleaned up after verification
 * - Only login action is performed - no data scraping
 * - Timeouts prevent hanging processes
 */
