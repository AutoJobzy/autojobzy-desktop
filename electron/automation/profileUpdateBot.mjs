/**
 * ======================== LOCAL PROFILE UPDATE BOT ========================
 * Runs Puppeteer automation locally in Electron with VISIBLE browser
 * Updates Naukri resume headline to keep profile fresh
 */

import { launchBrowser } from '../../server/utils/puppeteerHelper.js';

// Global state
let browser = null;
let isRunning = false;

/**
 * Delay helper
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safe navigation with retry
 */
async function safeGoto(page, url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: 45000
            });
            await delay(2000);
            return true;
        } catch (error) {
            if (attempt === maxRetries) {
                return false;
            }
            await delay(3000);
        }
    }
    return false;
}

/**
 * Login to Naukri
 */
async function loginToNaukri(page, email, password, addLog) {
    try {
        addLog('Opening Naukri login page...', 'info');
        const loginPageLoaded = await safeGoto(page, 'https://www.naukri.com/nlogin/login');
        if (!loginPageLoaded) {
            return false;
        }
        await delay(3000);

        addLog('Locating login fields...', 'info');

        // Email selectors
        const emailSelectors = [
            '#usernameField',
            'input[type="text"]',
            'input[placeholder*="Email"]',
            'input[placeholder*="email"]',
        ];

        // Password selectors
        const passwordSelectors = [
            '#passwordField',
            'input[type="password"]',
        ];

        // Find email field
        let emailSelector = null;
        for (const selector of emailSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    emailSelector = selector;
                    addLog(`✅ Found email field: ${selector}`, 'success');
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!emailSelector) {
            addLog('❌ Could not find email field', 'error');
            return false;
        }

        // Find password field
        let passSelector = null;
        for (const selector of passwordSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    passSelector = selector;
                    addLog(`✅ Found password field: ${selector}`, 'success');
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!passSelector) {
            addLog('❌ Could not find password field', 'error');
            return false;
        }

        // Enter credentials
        addLog('Entering credentials...', 'info');
        await page.click(emailSelector, { clickCount: 3 }).catch(() => {});
        await delay(200);
        await page.type(emailSelector, email, { delay: 100 });
        await delay(800);

        await page.click(passSelector, { clickCount: 3 }).catch(() => {});
        await delay(200);
        await page.type(passSelector, password, { delay: 100 });
        await delay(800);

        // Submit
        addLog('Submitting login form...', 'info');
        const submitSelectors = [
            "button[type='submit'].blue-btn",
            "button[type='submit']",
            "button.btn-large.blue-btn",
        ];

        let submitted = false;
        for (const selector of submitSelectors) {
            try {
                const submitBtn = await page.$(selector);
                if (submitBtn) {
                    await submitBtn.click();
                    submitted = true;
                    addLog(`✅ Clicked submit button`, 'info');
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!submitted) {
            addLog('No submit button found, pressing Enter...', 'info');
            await page.focus(passSelector);
            await page.keyboard.press('Enter');
        }

        // Wait for login response
        addLog('Waiting for login response...', 'info');
        await delay(5000);

        // Check if login successful
        const currentUrl = page.url();
        if (currentUrl.includes('nlogin')) {
            addLog('Login failed - still on login page', 'error');
            return false;
        }

        addLog('Login successful!', 'success');

        // Close popups
        try {
            const closeButtons = ['.crossIcon', '[class*="close"]', '.styles_modal-close__'];
            for (const selector of closeButtons) {
                try {
                    const closeBtn = await page.$(selector);
                    if (closeBtn) {
                        await closeBtn.click().catch(() => {});
                        await delay(500);
                    }
                } catch (e) {
                    // Ignore
                }
            }
            await page.keyboard.press('Escape').catch(() => {});
            await delay(500);
        } catch (e) {
            // Popups are optional
        }

        addLog('Session stabilized, ready to proceed', 'success');
        return true;

    } catch (error) {
        addLog(`Login error: ${error.message}`, 'error');
        return false;
    }
}

/**
 * Main profile update function - runs locally in Electron
 */
export async function runProfileUpdate(config, onLog = () => {}) {
    const {
        naukriEmail,
        naukriPassword
    } = config;

    if (isRunning) {
        return {
            success: false,
            error: 'Profile update already running'
        };
    }

    isRunning = true;
    const logs = [];

    const addLog = (message, type = 'info') => {
        const log = {
            timestamp: new Date().toLocaleTimeString(),
            message,
            type
        };
        logs.push(log);
        onLog(log);
        console.log(`[${type.toUpperCase()}] ${message}`);
    };

    try {
        addLog('🖥️  Starting Naukri profile update LOCALLY in Electron...', 'info');
        addLog(`Using account: ${naukriEmail}`, 'info');

        // Launch Puppeteer with VISIBLE browser (headful mode)
        const browserConfig = {
            headless: false,  // VISIBLE BROWSER - user can see automation
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--disable-blink-features=AutomationControlled',
                '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ],
            ignoreHTTPSErrors: true,
        };

        addLog('Launching browser window...', 'info');
        browser = await launchBrowser(browserConfig); // ✅ Auto-installs Chrome if missing

        const page = await browser.newPage();

        // Hide automation detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
            window.chrome = { runtime: {} };
        });

        await page.setViewport({ width: 1920, height: 1080 });

        // Login
        const loginSuccess = await loginToNaukri(page, naukriEmail, naukriPassword, addLog);
        if (!loginSuccess) {
            throw new Error('Login failed. Please check your credentials.');
        }

        // Navigate to profile page
        addLog('Navigating to profile page...', 'info');
        const profileLoaded = await safeGoto(page, 'https://www.naukri.com/mnjuser/profile');
        if (!profileLoaded) {
            throw new Error('Failed to load profile page');
        }
        await delay(3000);

        // Click edit button for resume headline
        addLog('Looking for resume headline edit button...', 'info');
        const editButtonSelectors = [
            '.widgetHead .edit',
            '.resumeHeadline .edit',
            '.editResume',
            '[data-qa="edit_resume_headline"]'
        ];

        let editClicked = false;
        for (const selector of editButtonSelectors) {
            try {
                const editBtn = await page.$(selector);
                if (editBtn) {
                    await editBtn.click();
                    addLog(`✅ Clicked edit button`, 'success');
                    editClicked = true;
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

        // Find and update headline textarea
        addLog('Updating resume headline...', 'info');
        const textareaSelectors = [
            'textarea[name="resumeHeadline"]',
            'textarea.resumeHeadline',
            'textarea[id*="headline"]'
        ];

        let headlineUpdated = false;
        for (const selector of textareaSelectors) {
            try {
                const textarea = await page.$(selector);
                if (textarea) {
                    // Get current value
                    const currentValue = await page.evaluate(sel => {
                        const elem = document.querySelector(sel);
                        return elem ? elem.value : null;
                    }, selector);

                    if (currentValue) {
                        // Append a space to make it "updated"
                        const newValue = currentValue + ' ';
                        await page.evaluate((sel, val) => {
                            const elem = document.querySelector(sel);
                            if (elem) {
                                elem.value = val;
                                elem.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }, selector, newValue);

                        addLog('✅ Resume headline updated (space appended)', 'success');
                        headlineUpdated = true;
                        break;
                    }
                }
            } catch (e) {
                continue;
            }
        }

        if (!headlineUpdated) {
            throw new Error('Could not update resume headline');
        }

        await delay(1000);

        // Click save button
        addLog('Saving changes...', 'info');
        const saveButtonSelectors = [
            'button[type="submit"]',
            '.saveButton',
            'button.saveButton',
            '[data-qa="save_resume_headline"]'
        ];

        let saveClicked = false;
        for (const selector of saveButtonSelectors) {
            try {
                const saveBtn = await page.$(selector);
                if (saveBtn) {
                    await saveBtn.click();
                    addLog(`✅ Clicked save button`, 'success');
                    saveClicked = true;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!saveClicked) {
            throw new Error('Could not find save button');
        }

        await delay(3000);

        // Summary
        addLog('', 'info');
        addLog('========================================', 'info');
        addLog('✅ PROFILE UPDATE COMPLETE', 'success');
        addLog('========================================', 'info');
        addLog('Your Naukri profile has been updated!', 'success');
        addLog('This will increase your visibility in recruiter searches.', 'info');
        addLog('========================================', 'info');

        return {
            success: true,
            logs,
            message: `Profile updated successfully`
        };

    } catch (error) {
        addLog(`Fatal error: ${error.message}`, 'error');
        return {
            success: false,
            logs,
            error: error.message
        };
    } finally {
        if (browser) {
            addLog('Closing browser...', 'info');
            await browser.close();
            browser = null;
        }
        isRunning = false;
    }
}

/**
 * Stop profile update
 */
export async function stopProfileUpdate() {
    if (!isRunning) {
        return { success: false, message: 'No profile update running' };
    }

    isRunning = false;

    if (browser) {
        try {
            await browser.close();
            browser = null;
        } catch (err) {
            // Ignore close errors
        }
    }

    return { success: true, message: 'Profile update stopped' };
}
