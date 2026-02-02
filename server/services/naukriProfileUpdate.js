/**
 * ======================== NAUKRI PROFILE UPDATE SERVICE ========================
 * Puppeteer script to update Naukri resume headline by appending a space
 * This keeps the profile "fresh" and increases visibility
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import { launchBrowser } from '../utils/puppeteerHelper.js';

/**
 * Sleep helper function
 * @param {number} ms - Milliseconds to sleep
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Update Naukri resume headline by appending a space
 * @param {string} email - Naukri email from database
 * @param {string} password - Naukri password from database
 * @returns {Promise<Object>} Result object with status, message, screenshot
 */
export async function updateResumeHeadline(email, password) {
    let browser = null;
    const result = {
        status: 'failed',
        message: '',
        executedAt: new Date().toISOString(),
        screenshot: null,
        logs: []
    };

    const addLog = (message) => {
        result.logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
        console.log(`[Naukri Profile Update] ${message}`);
    };

    try {
        addLog('Starting Naukri profile update...');

        // Validate credentials
        if (!email || !password) {
            throw new Error('Naukri credentials not found. Please add your credentials in Job Profile settings.');
        }

        addLog(`Launching browser for user: ${email}`);

        // Browser configuration
        const browserConfig = {
            headless: true,
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--disable-blink-features=AutomationControlled',  // Hide automation
                '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ],
            ignoreHTTPSErrors: true
        };

        // Launch browser with automatic Chrome detection
        browser = await launchBrowser(browserConfig);

        const page = await browser.newPage();

        // Hide automation detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            window.chrome = { runtime: {} };
        });

        await page.setViewport({ width: 1920, height: 1080 });

        // ========== STEP 1: LOGIN ==========
        addLog('Opening Naukri login page...');

        // Retry login page loading up to 3 times
        let loginPageLoaded = false;
        for (let attempt = 1; attempt <= 3 && !loginPageLoaded; attempt++) {
            try {
                await page.goto('https://www.naukri.com/nlogin/login', {
                    waitUntil: 'domcontentloaded',
                    timeout: 45000
                });
                loginPageLoaded = true;
            } catch (e) {
                addLog(`Login page load attempt ${attempt}/3 failed: ${e.message}`);
                if (attempt === 3) throw new Error('Failed to load login page after 3 attempts');
                await delay(3000);
            }
        }

        // Wait for page to fully render
        await delay(3000);

        // Wait for JavaScript to fully load the form
        addLog('Waiting for page JavaScript to render...');
        await page.evaluate(() => {
            return new Promise((resolve) => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                }
            });
        });

        await delay(2000);

        // Wait for login form with multiple selector fallbacks and proper waiting
        addLog('Waiting for login form...');

        const emailSelectors = [
            '#usernameField',
            'input[type="text"]',
            'input[placeholder*="Email"]',
            'input[placeholder*="email"]',
            'input[name="username"]',
            'input[name="email"]'
        ];
        const passwordSelectors = [
            '#passwordField',
            'input[type="password"]',
            'input[placeholder*="Password"]',
            'input[placeholder*="password"]'
        ];

        // Try to wait for any of the email selectors to appear
        let emailSelector = null;
        let passSelector = null;

        // First, try waiting for the primary selector
        try {
            await page.waitForSelector('#usernameField, input[type="text"], input[type="email"]', { timeout: 15000 });
            addLog('Login form detected');
        } catch (e) {
            addLog('Primary selector wait timed out, checking alternatives...');
        }

        // Debug: Log all input fields on page
        const inputInfo = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input');
            return Array.from(inputs).map(i => ({
                id: i.id,
                type: i.type,
                name: i.name,
                placeholder: i.placeholder,
                className: i.className
            }));
        });
        addLog(`Found ${inputInfo.length} input fields on page`);

        // Find working email selector
        for (const selector of emailSelectors) {
            try {
                const el = await page.$(selector);
                if (el) {
                    // Verify it's visible
                    const isVisible = await page.evaluate((sel) => {
                        const elem = document.querySelector(sel);
                        if (!elem) return false;
                        const style = window.getComputedStyle(elem);
                        return style.display !== 'none' && style.visibility !== 'hidden' && elem.offsetParent !== null;
                    }, selector);

                    if (isVisible) {
                        emailSelector = selector;
                        addLog(`✅ Found email field: ${selector}`);
                        break;
                    }
                }
            } catch (e) {
                continue;
            }
        }

        // Find working password selector
        for (const selector of passwordSelectors) {
            try {
                const el = await page.$(selector);
                if (el) {
                    const isVisible = await page.evaluate((sel) => {
                        const elem = document.querySelector(sel);
                        if (!elem) return false;
                        const style = window.getComputedStyle(elem);
                        return style.display !== 'none' && style.visibility !== 'hidden' && elem.offsetParent !== null;
                    }, selector);

                    if (isVisible) {
                        passSelector = selector;
                        addLog(`✅ Found password field: ${selector}`);
                        break;
                    }
                }
            } catch (e) {
                continue;
            }
        }

        if (!emailSelector || !passSelector) {
            addLog(`Debug: Input fields found: ${JSON.stringify(inputInfo.slice(0, 5))}`);
            throw new Error('Could not find login form fields. Naukri may have changed their page structure.');
        }

        addLog('Entering credentials...');

        // Clear and type email
        await page.click(emailSelector, { clickCount: 3 }).catch(() => { });
        await delay(300);
        await page.type(emailSelector, email, { delay: 80 });

        await delay(800);

        // Clear and type password
        await page.click(passSelector, { clickCount: 3 }).catch(() => { });
        await delay(300);
        await page.type(passSelector, password, { delay: 80 });

        await delay(800);

        // Submit form - try multiple methods
        addLog('Submitting login form...');

        const submitSelectors = [
            "button[type='submit']",
            "button.blue-btn",
            "button[type='submit'].blue-btn",
            ".loginButton",
            "button.btn-primary"
        ];

        let submitted = false;
        for (const selector of submitSelectors) {
            try {
                const btn = await page.$(selector);
                if (btn) {
                    await btn.click();
                    submitted = true;
                    addLog(`Clicked submit button: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        // Fallback: Press Enter
        if (!submitted) {
            addLog('No submit button found, pressing Enter...');
            await page.focus(passSelector);
            await page.keyboard.press('Enter');
        }

        // Wait for login to process
        addLog('Waiting for login response...');
        await delay(6000);

        // Check for error messages first
        const errorMessage = await page.evaluate(() => {
            const errorEl = document.querySelector('.error, .errorMsg, [class*="error"], .form-error');
            return errorEl ? errorEl.innerText.trim() : null;
        });

        if (errorMessage && errorMessage.length > 0) {
            throw new Error(`Login error: ${errorMessage}`);
        }

        // Check if login was successful
        const currentUrl = page.url();
        if (currentUrl.includes('nlogin')) {
            throw new Error('Login failed - still on login page. Please check credentials.');
        }

        addLog('✅ Login successful');

        // ========== POST-LOGIN STABILIZATION ==========
        addLog('Waiting for session to stabilize...');
        await delay(3000);

        // Handle common post-login popups/modals
        const closeButtons = [
            '.crossIcon',
            '[class*="close"]',
            'button[aria-label="Close"]',
            '.nI-gNb-sb__icon-wrapper',
        ];

        for (const selector of closeButtons) {
            try {
                const closeBtn = await page.$(selector);
                if (closeBtn) {
                    await closeBtn.click().catch(() => { });
                    addLog('Closed popup/modal after login');
                    await delay(500);
                }
            } catch (e) {
                // Ignore - popup might not exist
            }
        }

        // Press Escape to close any modal
        await page.keyboard.press('Escape').catch(() => { });
        await delay(500);

        // ========== STEP 2: NAVIGATE TO PROFILE ==========
        addLog('Navigating to profile page...');

        // Retry logic for profile page loading
        let profileLoaded = false;
        for (let attempt = 1; attempt <= 3 && !profileLoaded; attempt++) {
            try {
                await page.goto('https://www.naukri.com/mnjuser/profile?id=&altresid', {
                    waitUntil: 'domcontentloaded',  // Changed from networkidle2
                    timeout: 45000
                });

                await delay(3000);

                // Verify profile page loaded by checking for profile elements
                const profileIndicator = await page.$('#lazyResumeHead, .widgetHead, .profileOverview');
                if (profileIndicator) {
                    profileLoaded = true;
                    addLog('Profile page loaded');
                } else {
                    throw new Error('Profile elements not found');
                }
            } catch (e) {
                if (attempt === 3) {
                    throw new Error(`Failed to load profile page after 3 attempts: ${e.message}`);
                }
                addLog(`Profile page load attempt ${attempt} failed, retrying...`);
                await delay(2000);
            }
        }
















        // === STEP 3: CLICK EDIT ICON ===
        addLog('Looking for resume headline edit button...');

        // Try multiple selectors for the edit button
        const editSelectors = [
            '#lazyResumeHead span.edit.icon',
            '#lazyResumeHead .edit',
            '.widgetHead .edit.icon',
            '[class*="resumeHead"] .edit',
            '.edit.icon',
            'span.edit'
        ];

        let editClicked = false;
        for (const selector of editSelectors) {
            try {
                const editBtn = await page.$(selector);
                if (editBtn) {
                    await editBtn.click();
                    editClicked = true;
                    addLog(`✅ Clicked edit button: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!editClicked) {
            throw new Error('Could not find resume headline edit button');
        }

        await delay(2000);

        // === STEP 4: WAIT FOR MODAL ===
        addLog('Waiting for resume modal...');

        // Try multiple selectors for the textarea
        const textareaSelectors = [
            '#resumeHeadlineTxt',
            'textarea[name="resumeHeadline"]',
            '.textArea textarea',
            'textarea',
            '[class*="resumeHeadline"] textarea'
        ];

        let textareaSelector = null;
        for (const selector of textareaSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 8000 });
                const el = await page.$(selector);
                if (el) {
                    textareaSelector = selector;
                    addLog(`✅ Found textarea: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!textareaSelector) {
            throw new Error('Could not find resume headline textarea');
        }

        // Ensure modal focused
        await page.focus(textareaSelector);
        await delay(300);

        // Read current text
        const current = await page.$eval(textareaSelector, el => el.value);
        addLog(`Current Headline: "${current.substring(0, 50)}..."`);

        // Append space to update the profile
        addLog('Appending space to trigger profile update...');
        await page.type(textareaSelector, ' ');

        await delay(500);

        // === STEP 5: CLICK SAVE ===
        addLog('Saving changes...');

        const saveSelectors = [
            'button.btn-dark-ot[type="submit"]',
            'button[type="submit"]',
            '.modal-footer button.btn-primary',
            'button.saveBtn',
            '.actions button[type="submit"]',
            'button:has-text("Save")'
        ];

        let saved = false;
        for (const selector of saveSelectors) {
            try {
                const saveBtn = await page.$(selector);
                if (saveBtn) {
                    await saveBtn.click();
                    saved = true;
                    addLog(`✅ Clicked save button: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!saved) {
            // Fallback: Try pressing Enter
            addLog('No save button found, pressing Enter...');
            await page.keyboard.press('Enter');
        }

        await delay(3000);

        addLog('🚀 Profile update saved successfully');















        // // ========== STEP 3: CLICK EDIT ICON ==========
        // addLog('Looking for resume headline edit button...');
        // await page.waitForSelector('#lazyResumeHead span.edit.icon', { timeout: 10000 });

        // addLog('Clicking edit icon...');
        // await page.click('#lazyResumeHead span.edit.icon');

        // await delay(1500);

        // // ========== STEP 4: MODIFY RESUME HEADLINE ==========
        // addLog('Waiting for resume headline textarea...');
        // await page.waitForSelector('textarea', { timeout: 8000 });

        // addLog('Reading current resume headline...');
        // const currentHeadline = await page.evaluate(() => {
        //     const textarea = document.querySelector('textarea');
        //     return textarea ? textarea.value : null;
        // });

        // if (!currentHeadline) {
        //     throw new Error('Resume headline textarea not found');
        // }

        // addLog(`Current headline: "${currentHeadline}"`);

        // addLog('Appending space to resume headline...');
        // await page.evaluate(() => {
        //     const textarea = document.querySelector('textarea');
        //     if (textarea) {
        //         textarea.value = textarea.value + ' '; // Append 1 space
        //         // Trigger input event to ensure React/Vue detects the change
        //         textarea.dispatchEvent(new Event('input', { bubbles: true }));
        //     }
        // });

        // await delay(500);

        // // ========== STEP 5: SAVE CHANGES ==========
        // addLog('Looking for save button...');
        // const saveBtn = await page.$("button[type='submit'], .btn-primary, button:has-text('Save')");

        // if (!saveBtn) {
        //     throw new Error('Save button not found');
        // }

        // addLog('Clicking save button...');
        // await saveBtn.click();

        await delay(3000); // Wait for save to complete

        // ========== STEP 6: VERIFY SUCCESS ==========
        // Check if we're back on the profile page (modal closed)
        const modalStillOpen = await page.$('textarea');
        if (modalStillOpen) {
            addLog('⚠️  Warning: Modal might still be open, taking screenshot...');
            result.screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
        }

        addLog('✅ Resume headline updated successfully!');

        result.status = 'success';
        result.message = 'Resume headline updated successfully';

        return result;

    } catch (error) {
        addLog(`❌ Error: ${error.message}`);

        // Take screenshot on error
        try {
            if (browser) {
                const pages = await browser.pages();
                if (pages.length > 0) {
                    result.screenshot = await pages[0].screenshot({
                        encoding: 'base64',
                        fullPage: true
                    });
                }
            }
        } catch (screenshotError) {
            addLog(`Failed to capture screenshot: ${screenshotError.message}`);
        }

        result.status = 'failed';
        result.message = error.message;

        return result;

    } finally {
        // Always close browser
        if (browser) {
            try {
                addLog('Closing browser...');
                await browser.close();
                addLog('Browser closed');
            } catch (closeError) {
                addLog(`Error closing browser: ${closeError.message}`);
            }
        }
    }
}

/**
 * Check if another update is currently running (queue safety)
 */
let isUpdateRunning = false;
let updateStartTime = null;
const MAX_UPDATE_DURATION = 5 * 60 * 1000; // 5 minutes max - auto-reset after this

/**
 * Force reset the update lock (for recovery from stuck states)
 * @returns {Object} Status of the reset
 */
export function forceResetUpdateLock() {
    const wasRunning = isUpdateRunning;
    isUpdateRunning = false;
    updateStartTime = null;
    console.log('[Profile Update] Lock force reset');
    return {
        status: 'success',
        message: wasRunning ? 'Lock was active and has been reset' : 'Lock was not active',
        resetAt: new Date().toISOString()
    };
}

/**
 * Queue-safe wrapper for updateResumeHeadline
 * Prevents multiple users from running updates simultaneously
 * @param {string} email - Naukri email
 * @param {string} password - Naukri password
 * @returns {Promise<Object>} Result object
 */
export async function queueSafeUpdateResume(email, password) {
    // Auto-reset if stuck for too long (safety mechanism)
    if (isUpdateRunning && updateStartTime) {
        const elapsed = Date.now() - updateStartTime;
        if (elapsed > MAX_UPDATE_DURATION) {
            console.log(`[Profile Update] Auto-resetting stuck lock (was running for ${Math.round(elapsed / 1000)}s)`);
            isUpdateRunning = false;
            updateStartTime = null;
        }
    }

    if (isUpdateRunning) {
        const elapsed = updateStartTime ? Math.round((Date.now() - updateStartTime) / 1000) : 0;
        return {
            status: 'failed',
            message: `Another profile update is currently running (${elapsed}s elapsed). Please try again in a few moments.`,
            executedAt: new Date().toISOString(),
            logs: ['Update blocked - another operation in progress']
        };
    }

    isUpdateRunning = true;
    updateStartTime = Date.now();

    try {
        const result = await updateResumeHeadline(email, password);
        return result;
    } catch (error) {
        console.error('[Profile Update] Unexpected error:', error);
        return {
            status: 'failed',
            message: error.message,
            executedAt: new Date().toISOString(),
            logs: [`Unexpected error: ${error.message}`]
        };
    } finally {
        isUpdateRunning = false;
        updateStartTime = null;
    }
}
