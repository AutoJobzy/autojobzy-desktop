

/**
* ======================== AUTO APPLY MODULE ========================
* Main automation script for applying to jobs on Naukri.
* Fetches credentials from database (job_settings table).
* Handles login, job filtering, form filling, and chatbot interactions.
*
* Uses OLD login selectors:
*   #usernameField
*   #passwordField
*/

import puppeteer from 'puppeteer';
import fs from 'fs';
import {
    getAnswer,
    initializeAgenticService,
    getCheckboxSelection,
    getReasoningLog
} from './aiAnswer.js';
import sequelize from './db/config.js';
import XLSX from 'xlsx';
import JobApplicationResult from './models/JobApplicationResult.js';
import { launchBrowser } from './utils/puppeteerHelper.js';

// State management for automation
let isRunning = false;
let automationLogs = [];
let browser = null;
let jobResults = [];

/**
* Add log message with timestamp
* @param {string} message - Log message
* @param {string} type - Log type: 'info', 'success', 'error', 'warning'
*/
function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const log = { timestamp, message, type };
    automationLogs.push(log);
    // keep console logs simple for debugging
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    return log;
}

/**
* Sleep helper function
* @param {number} ms - Milliseconds to sleep
*/
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
* Safe navigation with retry logic
* Uses domcontentloaded + element verification for better reliability on JavaScript-heavy pages
* @param {Page} page - Puppeteer page object
* @param {string} url - URL to navigate to
* @param {number} maxRetries - Maximum retry attempts
* @returns {Promise<boolean>} - Success status
*/
async function safeGoto(page, url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Use domcontentloaded instead of networkidle2 (more reliable for JS-heavy pages)
            await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: 45000  // Increased timeout
            });

            // Additional wait for JavaScript to render content
            await delay(2000);

            // For job search pages, verify the page actually loaded by checking for key elements
            if (url.includes('naukri.com') && url.includes('-jobs')) {
                // Wait for either job listings or the "no jobs" message to appear
                const jobPageLoaded = await Promise.race([
                    page.waitForSelector('a.title, .srp-jobtuple-wrapper, .jobTuple, article[data-job-id]', { timeout: 15000 })
                        .then(() => 'jobs_found'),
                    page.waitForSelector('.noResult, .no-result, .styles_no-result__', { timeout: 15000 })
                        .then(() => 'no_jobs'),
                    delay(15000).then(() => 'timeout')
                ]).catch(() => 'error');

                if (jobPageLoaded === 'timeout' || jobPageLoaded === 'error') {
                    // Page loaded but no job elements found - might need refresh
                    addLog(`Page loaded but job elements not found. Verifying page content...`, 'warning');

                    // Check if page has any content at all
                    const hasContent = await page.evaluate(() => {
                        return document.body && document.body.innerText.length > 500;
                    });

                    if (!hasContent) {
                        throw new Error('Page appears empty');
                    }

                    // Try scrolling to trigger lazy loading
                    await autoScroll(page);
                    await delay(2000);
                }
            }

            return true;
        } catch (error) {
            addLog(`Page load attempt ${attempt} error: ${error.message}`, 'warning');

            if (attempt === maxRetries) {
                addLog(`Unable to load page after ${maxRetries} attempts. Please check your internet connection.`, 'error');
                return false;
            }
            addLog(`Page load issue detected. Retrying... (Attempt ${attempt + 1}/${maxRetries})`, 'warning');

            // Longer delay between retries
            await delay(3000);

            // Try to recover the page state before retry
            try {
                await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => { });
            } catch (e) {
                // Ignore reload errors
            }
        }
    }
    return false;
}

/**
* Fetch Naukri credentials from job_settings table
* @param {string} userId - User ID
* @returns {Promise<{email: string, password: string}>} Credentials from database
*/
async function fetchCredentialsFromDB(userId) {
    try {
        addLog(`Fetching credentials for user: ${userId}`, 'info');

        const [results] = await sequelize.query(
            'SELECT naukri_email, naukri_password FROM job_settings WHERE user_id = ? LIMIT 1',
            { replacements: [userId] }
        );

        if (!results || results.length === 0) {
            throw new Error('No job settings found for this user');
        }

        const result = results[0];

        if (!result.naukri_email || !result.naukri_password) {
            throw new Error('Naukri credentials not found. Please add your Naukri.com email and password in the Job Profile settings to continue.');
        }

        addLog('Credentials fetched from database successfully', 'success');
        return {
            email: result.naukri_email,
            password: result.naukri_password,
        };
    } catch (error) {
        addLog(`Database credential fetch error: ${error.message}`, 'error');
        throw error;
    }
}

/**
* Map years of experience (number) to Naukri dropdown option text
* @param {number} years - Years of experience from database
* @returns {string|null} - Matching dropdown option text, or null to skip
*/
function mapExperienceToOption(years) {
    if (years === null || years === undefined || years < 0) return null;

    // Map numeric experience to Naukri dropdown ranges
    if (years === 0) return '0-1 Yrs';
    if (years >= 1 && years < 3) return '1-3 Yrs';
    if (years >= 3 && years < 5) return '3-5 Yrs';
    if (years >= 5 && years < 7) return '5-7 Yrs';
    if (years >= 7 && years < 10) return '7-10 Yrs';
    if (years >= 10 && years < 15) return '10-15 Yrs';
    if (years >= 15 && years < 20) return '15-20 Yrs';
    if (years >= 20) return '20+ Yrs';

    return null;
}

/**
* Automatically select experience in Naukri search bar dropdown
* @param {puppeteer.Page} page - Puppeteer page instance
* @param {number} yearsOfExperience - Years of experience from database
*/
async function selectExperienceSearchBox(page, yearsOfExperience) {
    try {
        const experienceText = mapExperienceToOption(yearsOfExperience);

        if (!experienceText) {
            addLog(`Skipping experience selection (invalid value: ${yearsOfExperience})`, 'warning');
            return;
        }

        addLog(`Opening Experience dropdown in search bar...`, 'info');

        // Wait for and click experience dropdown
        await page.waitForSelector("#experienceDD", { timeout: 5000 });
        await page.click("#experienceDD");
        await delay(1500);

        // Get all available options
        const options = await page.$$eval(
            ".dropdownPrimary li",
            lis => lis.map(li => li.innerText.trim())
        );

        if (!options.length) {
            addLog('Experience dropdown is empty', 'warning');
            return;
        }

        addLog(`Available experience options: ${options.join(', ')}`, 'info');

        // Check if our desired option exists
        if (!options.includes(experienceText)) {
            addLog(`Experience option '${experienceText}' not found in dropdown`, 'warning');
            return;
        }

        addLog(`Auto-selecting experience: ${experienceText} (${yearsOfExperience} years)`, 'success');

        // Click the matching option
        await page.evaluate(text => {
            const li = Array.from(document.querySelectorAll(".dropdownPrimary li"))
                .find(el => el.innerText.trim() === text);
            if (li) li.click();
        }, experienceText);

        await delay(1000);
        addLog(`Experience '${experienceText}' selected successfully`, 'success');

    } catch (error) {
        addLog('Unable to select experience filter. Continuing without it...', 'warning');
    }
}

/**
* Auto-scroll page to load lazy-loaded content
* @param {puppeteer.Page} page - Puppeteer page instance
*/
async function autoScroll(page) {
    await page.evaluate(() => {
        return new Promise(resolve => {
            let totalHeight = 0;
            const distance = 400;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });
}

/**
* Fetch user preferences from database for checkbox matching
* @param {string} userId - User ID
* @returns {Promise<Object>} User preferences object
*/
async function fetchUserPreferences(userId) {
    try {
        // Fetch job settings
        const [jobSettings] = await sequelize.query(
            `SELECT target_role, location, current_c_t_c, expected_c_t_c,
                   notice_period, years_of_experience, search_keywords
            FROM job_settings WHERE user_id = ? LIMIT 1`,
            { replacements: [userId] }
        );

        // Fetch skills
        const [skills] = await sequelize.query(
            `SELECT skill_name FROM skills WHERE user_id = ?`,
            { replacements: [userId] }
        );

        // Fetch filter preferences
        const [filters] = await sequelize.query(
            `SELECT selected_filters FROM user_filters WHERE user_id = ? LIMIT 1`,
            { replacements: [userId] }
        );

        const preferences = {
            targetRole: jobSettings[0]?.target_role || '',
            location: jobSettings[0]?.location || '',
            currentCTC: jobSettings[0]?.current_ctc || 0,
            expectedCTC: jobSettings[0]?.expected_ctc || 0,
            noticePeriod: jobSettings[0]?.notice_period || 0,
            experience: jobSettings[0]?.years_of_experience || 0,
            keywords: jobSettings[0]?.search_keywords || '',
            skills: skills.map(s => s.skill_name) || [],
            filters: filters[0]?.selected_filters ? JSON.parse(filters[0].selected_filters) : {}
        };

        return preferences;
    } catch (error) {
        addLog(`Error fetching user preferences: ${error.message}`, 'warning');
        return {
            targetRole: '',
            location: '',
            skills: [],
            experience: 0,
            keywords: '',
            filters: {}
        };
    }
}

/**
* Normalize text for matching (lowercase, remove extra spaces, special chars)
* @param {string} text - Text to normalize
* @returns {string} Normalized text
*/
function normalizeText(text) {
    if (!text) return '';
    return text.toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ');
}

/**
* Check if two strings match (exact, partial, or fuzzy match)
* @param {string} text1 - First text
* @param {string} text2 - Second text
* @param {number} threshold - Match threshold (0-1), default 0.6
* @returns {boolean} Whether texts match
*/
function isTextMatch(text1, text2, threshold = 0.6) {
    const norm1 = normalizeText(text1);
    const norm2 = normalizeText(text2);

    // Exact match
    if (norm1 === norm2) return true;

    // Contains match
    if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

    // Word-by-word partial match
    const words1 = norm1.split(' ').filter(Boolean);
    const words2 = norm2.split(' ').filter(Boolean);

    const matchingWords = words1.filter(w1 =>
        words2.some(w2 => w1.includes(w2) || w2.includes(w1))
    );

    const matchScore = matchingWords.length / Math.max(words1.length, words2.length);
    return matchScore >= threshold;
}

/**
* Intelligent checkbox selection based on user preferences
* @param {puppeteer.Page} page - Puppeteer page instance
* @param {string} userId - User ID for fetching preferences
* @returns {Promise<boolean>} Whether checkbox was handled
*/
async function handleCheckBox(page, userId = null) {
    try {
        const checkboxSelector = ".checkBoxContainer input[type='radio'], .checkBoxContainer input[type='checkbox']";

        const checkboxes = await page.$$(checkboxSelector);
        if (!checkboxes || checkboxes.length === 0) {
            return false;
        }

        addLog(`Found ${checkboxes.length} checkbox options`, 'info');

        // Get checkbox labels and their corresponding elements
        const checkboxData = await page.evaluate((selector) => {
            const inputs = document.querySelectorAll(selector);
            return Array.from(inputs).map((input, index) => {
                // Try multiple methods to get label text
                let labelText = '';

                // Method 1: Check for associated label element
                if (input.id) {
                    const label = document.querySelector(`label[for="${input.id}"]`);
                    if (label) labelText = label.innerText.trim();
                }

                // Method 2: Check parent container for text
                if (!labelText) {
                    const parent = input.closest('.checkBoxContainer') || input.parentElement;
                    if (parent) {
                        // Get text content but exclude nested input values
                        labelText = Array.from(parent.childNodes)
                            .filter(node => node.nodeType === Node.TEXT_NODE ||
                                (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'INPUT'))
                            .map(node => node.textContent)
                            .join(' ')
                            .trim();
                    }
                }

                // Method 3: Check next sibling
                if (!labelText && input.nextSibling) {
                    labelText = input.nextSibling.textContent?.trim() || '';
                }

                return {
                    index: index,
                    label: labelText,
                    value: input.value || '',
                    type: input.type,
                    checked: input.checked
                };
            });
        }, checkboxSelector);

        addLog(`Checkbox options: ${checkboxData.map(c => c.label || c.value).join(', ')}`, 'info');

        // NEW: Use agentic AI to select best option
        let selectedIndex = 0;

        try {
            // Get the question from the chatbot
            const question = await page.evaluate(() => {
                const questionEl = document.querySelector('.botItem .botMsg span');
                return questionEl ? questionEl.innerText.trim() : 'Select option';
            });

            // Prepare options for AI
            const options = checkboxData.map(c => ({ label: c.label || c.value }));

            // Use AI to select best option
            selectedIndex = await getCheckboxSelection(options, question, userId);

            addLog(`AI selected option ${selectedIndex + 1}: "${checkboxData[selectedIndex].label || checkboxData[selectedIndex].value}"`, 'success');
        } catch (error) {
            addLog(`AI selection error, using fallback: ${error.message}`, 'warning');
            selectedIndex = 0;
        }

        let selectedIndices = [selectedIndex];

        // Click selected checkboxes
        const isRadio = checkboxData[0]?.type === 'radio';

        if (isRadio && selectedIndices.length > 1) {
            // For radio buttons, only select the first match
            selectedIndices = [selectedIndices[0]];
            addLog('Radio button detected - selecting only first match', 'info');
        }

        for (const index of selectedIndices) {
            try {
                await checkboxes[index].click();
                await delay(300);
                addLog(`Clicked checkbox ${index + 1}: ${checkboxData[index].label || checkboxData[index].value}`, 'success');
            } catch (err) {
                addLog(`Failed to click checkbox ${index + 1}: ${err.message}`, 'warning');
            }
        }

        await delay(500);
        return true;

    } catch (err) {
        addLog(`Checkbox handler error: ${err.message}`, 'error');
        return false;
    }
}

/**
* Login to Naukri using multiple selector strategies (adaptive)
* @param {puppeteer.Page} page - Puppeteer page instance
* @param {string} email - Naukri email
* @param {string} password - Naukri password
*/
async function loginToNaukri(page, email, password) {
    try {
        addLog('Opening Naukri login page...', 'info');
        const loginPageLoaded = await safeGoto(page, 'https://www.naukri.com/nlogin/login');
        if (!loginPageLoaded) {
            return false;
        }
        await delay(3000);

        // Wait for page to be fully loaded and interactive
        await page.evaluate(() => {
            return new Promise((resolve) => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                }
            });
        });

        await delay(1000);

        addLog('Locating login fields (trying multiple selectors)...', 'info');

        // Try multiple selector strategies for email/username field
        const emailSelectors = [
            '#usernameField',                           // Naukri current selector (2025)
            'input[type="text"]',                       // Generic text input
            'input[placeholder*="Email"]',              // Placeholder contains "Email"
            'input[placeholder*="email"]',              // Case insensitive
            'input[placeholder*="Username"]',           // Username variant
            'input[name="email"]',                      // Name attribute
            'input[name="username"]',                   // Username name attribute
            '.loginInput input[type="text"]',           // Common class pattern
            '#login_Layer input[type="text"]',          // Login layer pattern
            'form input[type="text"]:first-of-type'     // First text input in form
        ];

        // Try multiple selector strategies for password field
        const passwordSelectors = [
            '#passwordField',                           // Naukri current selector (2025)
            'input[type="password"]',                   // Generic password input
            'input[placeholder*="Password"]',           // Placeholder contains "Password"
            'input[placeholder*="password"]',           // Case insensitive
            'input[name="password"]',                   // Name attribute
            '.loginInput input[type="password"]',       // Common class pattern
            '#login_Layer input[type="password"]',      // Login layer pattern
            'form input[type="password"]'               // Password input in form
        ];

        // Debug: Check what's actually on the page
        const pageContent = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input');
            return {
                totalInputs: inputs.length,
                inputTypes: Array.from(inputs).map(i => ({
                    id: i.id,
                    type: i.type,
                    placeholder: i.placeholder
                }))
            };
        });
        addLog(`Debug: Found ${pageContent.totalInputs} input fields on page`, 'info');

        // Find working email selector
        let emailSelector = null;
        for (const selector of emailSelectors) {
            try {
                // Just check if element exists, don't worry about visibility
                const element = await page.$(selector);

                if (element) {
                    emailSelector = selector;
                    addLog(`✅ Found email field: ${selector}`, 'success');
                    break;
                }
            } catch (e) {
                // Try next selector
                continue;
            }
        }

        if (!emailSelector) {
            addLog('❌ Could not find email/username field with any known selector', 'error');
            addLog(`Debug: Input fields found: ${JSON.stringify(pageContent.inputTypes.slice(0, 5))}`, 'info');
            addLog('💡 Run: node debug-naukri-selectors.js to find current selectors', 'info');
            return false;
        }

        // Find working password selector
        let passSelector = null;
        for (const selector of passwordSelectors) {
            try {
                // Just check if element exists, don't worry about visibility
                const element = await page.$(selector);

                if (element) {
                    passSelector = selector;
                    addLog(`✅ Found password field: ${selector}`, 'success');
                    break;
                }
            } catch (e) {
                // Try next selector
                continue;
            }
        }

        if (!passSelector) {
            addLog('❌ Could not find password field with any known selector', 'error');
            addLog('💡 Run: node debug-naukri-selectors.js to find current selectors', 'info');
            return false;
        }

        // Enter credentials
        addLog('Entering credentials...', 'info');

        // Clear and type email
        await page.click(emailSelector, { clickCount: 3 }).catch(() => { });
        await delay(200);
        await page.type(emailSelector, email, { delay: 100 });

        await delay(800);

        // Clear and type password
        await page.click(passSelector, { clickCount: 3 }).catch(() => { });
        await delay(200);
        await page.type(passSelector, password, { delay: 100 });

        await delay(800);

        // Submit form - try multiple methods
        addLog('Submitting login form...', 'info');

        const submitSelectors = [
            "button[type='submit'].blue-btn",           // Naukri current (2025)
            "button[type='submit']",
            "button.btn-large.blue-btn",                // Naukri specific
            "button.btn-primary",
            "button.loginButton",
            ".loginButton",
            "input[type='submit']",
            "form button",
        ];

        let submitted = false;

        // Try to find and click submit button
        for (const selector of submitSelectors) {
            try {
                const submitBtn = await page.$(selector);
                if (submitBtn) {
                    await submitBtn.click();
                    submitted = true;
                    addLog(`✅ Clicked submit button: ${selector}`, 'info');
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        // Fallback: Press Enter on password field
        if (!submitted) {
            addLog('No submit button found, pressing Enter...', 'info');
            await page.focus(passSelector);
            await page.keyboard.press('Enter');
        }

        // Wait for navigation or error message
        addLog('Waiting for login response...', 'info');
        await delay(5000);

        // Check if login was successful
        const currentUrl = page.url();

        // Check for error messages
        const errorMessage = await page.evaluate(() => {
            const errorEl = document.querySelector('.error, .errorMsg, [class*="error"]');
            return errorEl ? errorEl.innerText.trim() : null;
        });

        if (errorMessage) {
            addLog(`Login error message: ${errorMessage}`, 'error');
            return false;
        }

        // If still on login page, login failed
        if (currentUrl.includes('nlogin')) {
            addLog('Login failed - still on login page', 'error');
            addLog('Please check your credentials', 'error');
            return false;
        }

        addLog('Login successful!', 'success');

        // ========== POST-LOGIN STABILIZATION ==========
        // Wait for any redirects to complete and session to stabilize
        addLog('Waiting for session to stabilize...', 'info');
        await delay(3000);

        // Handle common post-login popups/modals that Naukri shows
        try {
            // Close profile update popup if present
            const closeButtons = [
                '.crossIcon',                           // Common close button
                '[class*="close"]',                     // Any close class
                '.styles_modal-close__',                // Modal close
                'button[aria-label="Close"]',           // Aria close
                '.nI-gNb-sb__icon-wrapper',             // Notification close
                '.styles_close__',                      // Various close styles
            ];

            for (const selector of closeButtons) {
                try {
                    const closeBtn = await page.$(selector);
                    if (closeBtn) {
                        await closeBtn.click().catch(() => { });
                        addLog('Closed popup/modal after login', 'info');
                        await delay(500);
                    }
                } catch (e) {
                    // Ignore - popup might not exist
                }
            }

            // Press Escape to close any modal
            await page.keyboard.press('Escape').catch(() => { });
            await delay(500);
        } catch (e) {
            // Popups are optional, continue if none found
        }

        addLog('Session stabilized, ready to proceed', 'success');
        return true;

    } catch (error) {
        addLog(`Login error: ${error.message}`, 'error');
        return false;
    }
}

/**
* Handle chatbot questions and provide AI-generated answers
* @param {puppeteer.Page} jobPage - Puppeteer page instance
* @param {string} userId - User ID for intelligent checkbox matching
*/
async function handleChatbot(jobPage, userId = null) {
    try {
        await jobPage.waitForSelector('.chatbot_MessageContainer', { timeout: 5000 });

        const answered = new Set();
        const maxPolls = 20;

        for (let j = 0; j < maxPolls; j++) {
            const questions = await jobPage.$$eval('.botItem .botMsg span', spans =>
                spans.map(s => s.innerText.trim()).filter(Boolean)
            );

            for (let q of questions) {
                if (answered.has(q)) continue;
                answered.add(q);

                addLog(`Question: ${q}`, 'info');

                // First try handling checkbox with intelligent matching
                const checkboxHandled = await handleCheckBox(jobPage, userId);
                if (checkboxHandled) {
                    addLog('Checkbox question auto-answered', 'success');
                    const nextBtn = await jobPage.$('.sendMsg');
                    if (nextBtn) await nextBtn.click();
                    continue;
                }

                // 🔹 Handle RADIO buttons (Yes / No / Skip)
                const radioHandled = await handleRadioButtons(jobPage, userId);
                if (radioHandled) {
                    addLog('Radio question auto-answered', 'success');
                    const nextBtn = await jobPage.$('.sendMsg');
                    if (nextBtn) await nextBtn.click();
                    continue;
                }

                // AI-generated text answer
                const aiAnswer = await getAnswer(q);
                addLog(`AI Answer: ${aiAnswer}`, 'success');

                // Reasoning logs disabled (agentic AI disabled)
                // const reasoningLog = getReasoningLog();
                // if (reasoningLog.length > 0) {
                //     const lastReasoning = reasoningLog[reasoningLog.length - 1];
                //     if (lastReasoning.reasoning && lastReasoning.reasoning.length > 0) {
                //         addLog(`  Reasoning: ${lastReasoning.reasoning.join(' → ')}`, 'info');
                //     }
                //     if (lastReasoning.confidence) {
                //         addLog(`  Confidence: ${lastReasoning.confidence}%`, 'info');
                //     }
                // }

                const inputSelector = ".textArea[contenteditable='true']";

                // ensure input exists
                const exists = await jobPage.$(inputSelector);
                if (!exists) {
                    addLog('Chat input not found, skipping this question', 'warning');
                    continue;
                }

                await jobPage.focus(inputSelector);

                await jobPage.evaluate((sel, answer) => {
                    const el = document.querySelector(sel);
                    if (el) {
                        // Some chat inputs use innerText, some use innerHTML; innerText is usually fine
                        el.innerText = answer;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, inputSelector, aiAnswer);

                const sendBtn = await jobPage.$('.sendMsg');
                if (sendBtn) await sendBtn.click();

                await delay(1000);
            }

            await delay(1000);
        }

        addLog('Chatbot answers completed!', 'success');
    } catch (err) {
        addLog(`Error in chatbot auto-answer: ${err.message}`, 'warning');
    }
}

/**
* Scrape comprehensive job details from Naukri job page
* @param {puppeteer.Page} jobPage - Puppeteer page instance
* @returns {Promise<Object>} Job details object
*/
async function scrapeJobDetails(jobPage) {
    try {
        const jobDetails = await jobPage.evaluate(() => {
            // Helper function to safely get text content
            const getText = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.innerText.trim() : null;
            };

            // Helper function to get text from multiple elements
            const getTexts = (selector) => {
                const elements = document.querySelectorAll(selector);
                return Array.from(elements).map(el => el.innerText.trim()).filter(Boolean);
            };

            // Job Title
            const jobTitle = getText('h1.styles_jd-header-title__rZwM1');

            // Company Name
            const companyName = getText('.styles_jd-header-comp-name__MvqAI > a');

            // Experience Required
            const experienceRequired = getText('.styles_jhc__exp__k_giM span');

            // Salary
            const salary = getText('.styles_jhc__salary__jdfEC span');

            // Location
            const location = getText('.styles_jhc__location__W_pVs a');

            // Job Statistics (Posted Date, Openings, Applicants)
            const stats = document.querySelectorAll('.styles_jhc__stat__PgY67');
            const postedDate = stats[0] ? stats[0].querySelector('span:last-child')?.innerText.trim() : null;
            const openings = stats[1] ? stats[1].querySelector('span:last-child')?.innerText.trim() : null;
            const applicants = stats[2] ? stats[2].querySelector('span:last-child')?.innerText.trim() : null;

            // Key Skills
            const keySkills = getTexts('.styles_chip__7YCfG span');

            // Company Rating
            const companyRating = getText('.styles_amb-rating__4UyFL');

            // Job Highlights
            const jobHighlights = getTexts('.styles_JDC__job-highlight-list__QZC12 li');

            // Role, Industry Type, Department, Employment Type, Role Category
            const detailLabels = document.querySelectorAll('.styles_other-details__oEN4O .styles_details__Y424J');
            let role = null;
            let industryType = null;
            let employmentType = null;
            let roleCategory = null;

            detailLabels.forEach(detail => {
                const label = detail.querySelector('label')?.innerText.trim();
                const value = detail.querySelector('span')?.innerText.trim() ||
                    detail.querySelector('a')?.innerText.trim();

                if (label?.includes('Role:')) role = value;
                if (label?.includes('Industry Type:')) industryType = value;
                if (label?.includes('Employment Type:')) employmentType = value;
                if (label?.includes('Role Category:')) roleCategory = value;
            });

            return {
                jobTitle,
                companyName,
                experienceRequired,
                salary,
                location,
                postedDate,
                openings,
                applicants,
                keySkills: keySkills.join(', '),  // Convert array to comma-separated string
                companyRating,
                jobHighlights: jobHighlights.join(' | '),  // Convert array to pipe-separated string
                role,
                industryType,
                employmentType,
                roleCategory,
            };
        });

        addLog(`Scraped job details: ${jobDetails.jobTitle || 'Unknown'} at ${jobDetails.companyName || 'Unknown'}`, 'success');
        return jobDetails;

    } catch (error) {
        addLog(`Error scraping job details: ${error.message}`, 'warning');
        return {
            jobTitle: null,
            companyName: null,
            experienceRequired: null,
            salary: null,
            location: null,
            postedDate: null,
            openings: null,
            applicants: null,
            keySkills: null,
            companyRating: null,
            jobHighlights: null,
            role: null,
            industryType: null,
            employmentType: null,
            roleCategory: null,
        };
    }
}

/**
* Save results to Excel file
*/
function saveToExcel() {
    try {
        const ws = XLSX.utils.json_to_sheet(jobResults);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, 'Naukri Results');
        XLSX.writeFile(wb, 'naukri_results.xlsx');

        addLog('Excel Saved: naukri_results.xlsx', 'success');
    } catch (err) {
        addLog(`Error saving Excel: ${err.message}`, 'error');
    }
}

/**
* Main automation function
* @param {Object} options - Configuration options
* @param {string} options.userId - User ID (required for DB credential lookup)
* @param {string} options.jobUrl - URL of filtered job listings page
* @param {number} options.maxPages - Maximum pages to process (default: 10)
* @param {string} options.naukriEmail - Optional email (overrides DB)
* @param {string} options.naukriPassword - Optional password (overrides DB)
*/
export async function startAutomation(options = {}) {
    if (isRunning) {
        addLog('Automation already running', 'warning');
        return { success: false, message: 'Already running' };
    }

    isRunning = true;
    automationLogs = [];
    jobResults = [];

    const {
        userId = null,
        jobUrl = null,
        maxPages = 10,
        naukriEmail = null,
        naukriPassword = null,
    } = options;

    try {
        // ========== STEP 1: GET CREDENTIALS ==========
        let email = naukriEmail;
        let password = naukriPassword;

        // If credentials not provided directly, fetch from database
        if ((!email || !password) && userId) {
            addLog('Fetching credentials from database...', 'info');
            const dbCredentials = await fetchCredentialsFromDB(userId);
            email = dbCredentials.email;
            password = dbCredentials.password;
        }

        // Validate credentials
        if (!email || !password) {
            throw new Error('No Naukri credentials found. Please save your credentials in the Config tab first.');
        }

        addLog(`Using Naukri account: ${email}`, 'info');

        // ========== STEP 1.5: GET JOB URL FROM DATABASE ==========
        let finalJobUrl = jobUrl;

        if (!finalJobUrl && userId) {
            finalJobUrl = await fetchFinalUrlFromDB(userId);

            if (finalJobUrl) {
                addLog(`✅ Using your saved search URL from 'ENTER YOUR SEARCH URL' field`, "success");
                addLog(`🔗 URL: ${finalJobUrl.substring(0, 80)}...`, "info");
            } else {
                addLog(`⚠️ No search URL found in database. Using default fallback URL.`, "warning");
                finalJobUrl = "https://www.naukri.com/java-full-stack-developer-jobs?k=java+full+stack+developer";
            }
        }



        async function fetchFinalUrlFromDB(userId) {
            try {
                const [rows] = await sequelize.query(
                    `SELECT final_url
            FROM user_filters
            WHERE user_id = :userId
            LIMIT 1`,
                    { replacements: { userId } }
                );

                if (!rows || rows.length === 0) {
                    console.log("❌ No saved search URL found in database for userId:", userId);
                    return null;
                }

                const url = rows[0]?.final_url;

                if (!url || url.trim() === "") {
                    console.log("⚠️ Search URL is empty in database for user:", userId);
                    return null;
                }

                console.log("✅ Found saved search URL from 'ENTER YOUR SEARCH URL' field");
                console.log("🔗 URL:", url.substring(0, 100) + (url.length > 100 ? '...' : ''));
                return url.trim();
            } catch (err) {
                console.error('❌ Database error fetching URL:', err.message);
                addLog('Unable to retrieve saved job URL from database', 'warning');
                return null;
            }
        }

        // Use default URL if still not found
        if (!finalJobUrl) {
            finalJobUrl = 'https://www.naukri.com/java-full-stack-developer-jobs?k=java+full+stack+developer&experience=3&jobAge=1';
            addLog(`Using default job URL: ${finalJobUrl}`, 'warning');
        }

        // ========== STEP 2: LAUNCH BROWSER ==========
        addLog('Launching browser...', 'info');

        // Production-ready configuration
        const browserConfig = {
            headless: true,
            defaultViewport: null,

            // Browser args for automation
            args: [
                '--no-sandbox',                    // CRITICAL: Required for Docker/EC2
                '--disable-setuid-sandbox',        // CRITICAL: Required for Docker/EC2
                '--disable-dev-shm-usage',         // Prevents /dev/shm issues
                '--disable-accelerated-2d-canvas', // Prevents GPU crashes
                '--no-first-run',                  // Skip first run wizards
                '--no-zygote',                     // Helps with some Linux environments
                '--disable-gpu',                   // Disable GPU hardware acceleration
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-web-security',          // Needed for some automation
                '--disable-features=IsolateOrigins,site-per-process',
                '--window-size=1920,1080',         // Better than --start-maximized on headless
                '--disable-blink-features=AutomationControlled',  // CRITICAL: Hide automation
                '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ],

            // Ignore certificate errors
            ignoreHTTPSErrors: true,
        };

        // Use helper to launch browser with automatic Chrome detection
        browser = await launchBrowser(browserConfig);

        const page = await browser.newPage();

        // CRITICAL: Hide automation detection
        await page.evaluateOnNewDocument(() => {
            // Override navigator.webdriver
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });

            // Mock plugins and languages
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });

            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
            });

            // Override chrome detection
            window.chrome = {
                runtime: {},
            };

            // Mock permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });

        // Set proper viewport
        await page.setViewport({ width: 1920, height: 1080 });

        // ========== STEP 3: LOGIN ==========
        const loginSuccess = await loginToNaukri(page, email, password);
        if (!loginSuccess) {
            throw new Error('Login failed. Please check your credentials and page selectors.');
        }

        // ========== STEP 3.5: FETCH YEARS OF EXPERIENCE FROM DATABASE ==========
        let yearsOfExperience = 0;
        if (userId) {
            try {
                const [jobSettings] = await sequelize.query(
                    'SELECT years_of_experience FROM job_settings WHERE user_id = ? LIMIT 1',
                    { replacements: [userId] }
                );

                if (jobSettings && jobSettings.length > 0) {
                    yearsOfExperience = jobSettings[0].years_of_experience || 0;
                    addLog(`Fetched years of experience from database: ${yearsOfExperience}`, 'info');
                } else {
                    addLog('No job settings found, using default experience: 0', 'warning');
                }
            } catch (error) {
                addLog(`Failed to fetch years of experience: ${error.message}`, 'warning');
            }
        }

        // ========== STEP 3.75: AGENTIC AI DISABLED ==========
        // if (userId) {
        //     try {
        //         const dbConfig = {
        //             host: process.env.DB_HOST || 'database-1.c72i2s6muax7.ap-south-1.rds.amazonaws.com',
        //             user: process.env.DB_USER || 'admin',
        //             password: process.env.DB_PASSWORD || 'YsjlUaX5yFJGtZqjmrSj',
        //             database: process.env.DB_NAME || 'jobautomate',
        //             port: parseInt(process.env.DB_PORT || '3306', 10)
        //         };
        //         initializeAgenticService(userId, dbConfig);
        //         addLog('Agentic AI system initialized', 'success');
        //     } catch (error) {
        //         addLog(`Failed to initialize agentic AI: ${error.message}`, 'warning');
        //     }
        // }

        // ========== STEP 4: PROCESS JOB PAGES ==========
        // Use the finalJobUrl directly without modification
        let currentPage = 1;
        let totalJobsApplied = 0;
        let totalJobsSkipped = 0;
        const skipReasons = {}; // Track reasons for skipping

        while (currentPage <= maxPages && isRunning) {
            // For first page, use URL as-is. For subsequent pages, append page parameter
            // let pageUrl = finalJobUrl;
            // if (currentPage > 1) {
            //     // Add or update page parameter in URL
            //     const urlObj = new URL(finalJobUrl);
            //     urlObj.searchParams.set('pageNo', currentPage.toString());
            //     pageUrl = urlObj.toString();
            // }

            let pageUrl = finalJobUrl;
            if (currentPage > 1) {
                const urlParts = finalJobUrl.split('-jobs');
                pageUrl = `${urlParts[0]}-jobs-${currentPage}${urlParts[1] || ''}`;
            }

            addLog(`Opening Page ${currentPage}/${maxPages}: ${pageUrl}`, 'info');
            const pageLoaded = await safeGoto(page, pageUrl);
            if (!pageLoaded) {
                addLog('Skipping this page due to loading issues...', 'warning');
                continue;
            }
            // await delay(2000);

            // // ========== SELECT EXPERIENCE (Only on first page) ==========
            // if (currentPage === 1 && yearsOfExperience >= 0) {
            //     addLog('Attempting to select experience in search bar...', 'info');
            //     await selectExperienceSearchBox(page, yearsOfExperience);
            //     await delay(2000); // Wait for page to refresh with filter applied
            // }

            await autoScroll(page);
            await delay(1000);

            // Try multiple selectors for job listings (Naukri updates their HTML frequently)
            let jobLinks = [];

            const jobLinkSelectors = [
                'a.title',                              // Current Naukri selector
                '.jobTuple a.title',                    // Job tuple wrapper
                'article[data-job-id] a',               // Article with job ID
                '.srp-jobtuple-wrapper a.title',        // SRP wrapper
                '.cust-job-tuple a.title',              // Custom job tuple
                '.list a[href*="job-listings"]',        // Any list with job links
                'a[href*="job-listings"]',              // Fallback: any job listing link
            ];

            for (const selector of jobLinkSelectors) {
                try {
                    const links = await page.$$eval(selector, elements =>
                        elements
                            .map(a => a.href)
                            .filter(x => typeof x === 'string' && x.includes('job-listings'))
                    );

                    if (links.length > 0) {
                        jobLinks = [...new Set(links)]; // Remove duplicates
                        addLog(`Found jobs using selector: ${selector}`, 'info');
                        break;
                    }
                } catch (e) {
                    // Try next selector
                    continue;
                }
            }

            // If still no jobs found, try a more aggressive search
            if (jobLinks.length === 0) {
                addLog('Standard selectors failed, trying aggressive link search...', 'warning');
                try {
                    jobLinks = await page.evaluate(() => {
                        const allLinks = Array.from(document.querySelectorAll('a'));
                        return allLinks
                            .map(a => a.href)
                            .filter(href => href && href.includes('job-listings'))
                            .filter((href, index, self) => self.indexOf(href) === index); // Unique
                    });
                } catch (e) {
                    addLog(`Aggressive search also failed: ${e.message}`, 'warning');
                }
            }

            addLog(`Found ${jobLinks.length} jobs on page ${currentPage}`, 'info');

            // Process each job
            for (let i = 0; i < jobLinks.length && isRunning; i++) {
                // Early exit check
                if (!isRunning) {
                    addLog('Automation stopped by user', 'warning');
                    break;
                }

                const link = jobLinks[i];
                addLog(`Opening job ${i + 1}/${jobLinks.length}: ${link}`, 'info');

                const jobPage = await browser.newPage();
                try {
                    await jobPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
                } catch (navError) {
                    addLog(`Failed to load job page: ${navError.message}`, 'warning');
                    await jobPage.close();
                    continue;
                }
                await delay(2000);

                // Check again after page load
                if (!isRunning) {
                    await jobPage.close();
                    addLog('Automation stopped by user', 'warning');
                    break;
                }

                // Scrape job details from the page
                const scrapedDetails = await scrapeJobDetails(jobPage);

                let canApply = false;
                let match = null;
                let matchResult = {
                    earlyApplicant: false,
                    keySkillsMatch: false,
                    locationMatch: false,
                    experienceMatch: false,
                    matchScore: 0,
                    matchScoreTotal: 5,
                    matchStatus: 'Poor Match'
                };

                // Check match score
                try {
                    await jobPage.waitForSelector('.styles_JDC__match-score__VnjLL', { timeout: 5000 });

                    const matchData = await jobPage.evaluate(() => {
                        const container = document.querySelector('.styles_JDC__match-score__VnjLL');
                        if (!container) return null;

                        const blocks = container.querySelectorAll('.styles_MS__details__iS7mj');

                        const isMatched = (el) =>
                            !!el?.querySelector('.ni-icon-check_circle');

                        return {
                            earlyApplicant: isMatched(blocks[0]),
                            keySkills: isMatched(blocks[1]),
                            location: isMatched(blocks[2]),
                            experience: isMatched(blocks[3])
                        };
                    });

                    if (!matchData) {
                        addLog('Match score container not found', 'warning');
                    } else {
                        addLog(
                            `Match Details → Early:${matchData.earlyApplicant}, Skills:${matchData.keySkills}, Location:${matchData.location}, Exp:${matchData.experience}`,
                            'info'
                        );

                        const matchScore =
                            (matchData.earlyApplicant ? 1 : 0) +
                            (matchData.keySkills ? 1 : 0) +
                            (matchData.location ? 1 : 0) +
                            (matchData.experience ? 1 : 0);

                        canApply = matchScore >= 4;  // Only apply if all 4 criteria match

                        addLog(
                            canApply
                                ? 'Good match - Eligible to apply'
                                : 'Poor match - Skipping...',
                            canApply ? 'success' : 'warning'
                        );

                        // 👉 THIS is what you will save in DB
                        matchResult = {
                            earlyApplicant: matchData.earlyApplicant,
                            keySkillsMatch: matchData.keySkills,
                            locationMatch: matchData.location,
                            experienceMatch: matchData.experience,
                            matchScore,
                            matchStatus: canApply ? 'Good Match' : 'Poor Match'
                        };
                    }
                } catch (err) {
                    addLog('Error while evaluating match score', 'error');
                }

                // Check apply button type
                const externalApply = await jobPage.$('#company-site-button');
                const applyBtn = await jobPage.$('#apply-button');

                // Determine apply type
                let applyType = 'No Apply Button';
                if (externalApply) applyType = 'External Apply';
                else if (applyBtn) applyType = 'Direct Apply';

                // Default status - will be updated after successful application
                let applicationStatus = 'Skipped';

                // Save job result with scraped details
                const jobResult = {
                    datetime: new Date(),
                    pageNumber: currentPage,
                    jobNumber: `${i + 1}/${jobLinks.length}`,
                    companyUrl: link,

                    EarlyApplicant: matchResult.earlyApplicant ? 'Yes' : 'No',
                    KeySkillsMatch: matchResult.keySkillsMatch ? 'Yes' : 'No',
                    LocationMatch: matchResult.locationMatch ? 'Yes' : 'No',
                    ExperienceMatch: matchResult.experienceMatch ? 'Yes' : 'No',

                    MatchScore: `${matchResult.matchScore}/${matchResult.matchScoreTotal}`,
                    matchStatus: matchResult.matchStatus,
                    applyType: applyType,
                    applicationStatus: applicationStatus,

                    // Scraped job details
                    jobTitle: scrapedDetails.jobTitle,
                    companyName: scrapedDetails.companyName,
                    experienceRequired: scrapedDetails.experienceRequired,
                    salary: scrapedDetails.salary,
                    location: scrapedDetails.location,
                    postedDate: scrapedDetails.postedDate,
                    openings: scrapedDetails.openings,
                    applicants: scrapedDetails.applicants,
                    keySkills: scrapedDetails.keySkills,
                    role: scrapedDetails.role,
                    industryType: scrapedDetails.industryType,
                    employmentType: scrapedDetails.employmentType,
                    roleCategory: scrapedDetails.roleCategory,
                    companyRating: scrapedDetails.companyRating,
                    jobHighlights: scrapedDetails.jobHighlights
                };

                // Add to results array
                jobResults.push(jobResult);

                // Skip external apply or poor match
                if (externalApply || !applyBtn || !canApply) {
                    totalJobsSkipped++;

                    // Track skip reason
                    let skipReason = '';
                    if (externalApply) {
                        skipReason = 'External Apply';
                    } else if (!applyBtn) {
                        skipReason = 'No Apply Button';
                    } else if (!canApply) {
                        skipReason = 'Poor Match';
                    }

                    skipReasons[skipReason] = (skipReasons[skipReason] || 0) + 1;
                    addLog(`⏭️  Job skipped (${skipReason}) - Total skipped: ${totalJobsSkipped}`, 'warning');

                    await jobPage.close();
                    await delay(1000);
                    continue;
                }

                // Apply process
                addLog('Clicking apply button...', 'info');
                await applyBtn.click();
                await delay(5000);

                // Handle chatbot with intelligent checkbox matching
                await handleChatbot(jobPage, userId);

                // Mark as Applied ONLY after successful application
                jobResult.applicationStatus = 'Applied';

                totalJobsApplied++;
                addLog(`Job application submitted! Total applied: ${totalJobsApplied}`, 'success');

                await jobPage.close();

            }

            currentPage++;
        }

        // Save results to Excel
        saveToExcel();

        // Save results to database (bulk insert)
        if (jobResults.length > 0) {
            try {
                addLog(`Saving ${jobResults.length} results to database...`, 'info');

                const dbResults = jobResults.map(result => ({
                    userId: userId,
                    datetime: result.datetime || new Date(),
                    pageNumber: result.pageNumber,
                    jobNumber: result.jobNumber,
                    companyUrl: result.companyUrl,
                    earlyApplicant: result.EarlyApplicant === 'Yes',
                    keySkillsMatch: result.KeySkillsMatch === 'Yes',
                    locationMatch: result.LocationMatch === 'Yes',
                    experienceMatch: result.ExperienceMatch === 'Yes',
                    matchScore: parseInt(result.MatchScore.split('/')[0]),
                    matchScoreTotal: 5,
                    matchStatus: result.matchStatus,
                    applyType: result.applyType,
                    applicationStatus: result.applicationStatus || null,
                    // Job details from scraping
                    jobTitle: result.jobTitle || null,
                    companyName: result.companyName || null,
                    experienceRequired: result.experienceRequired || null,
                    salary: result.salary || null,
                    location: result.location || null,
                    postedDate: result.postedDate || null,
                    openings: result.openings || null,
                    applicants: result.applicants || null,
                    keySkills: result.keySkills || null,
                    role: result.role || null,
                    industryType: result.industryType || null,
                    employmentType: result.employmentType || null,
                    roleCategory: result.roleCategory || null,
                    companyRating: result.companyRating || null,
                    jobHighlights: result.jobHighlights || null,
                }));

                // Safe insert with deduplication
                // ignoreDuplicates: true - Skips records with duplicate company_url
                // updateOnDuplicate: Updates existing records instead of skipping
                const savedResults = await JobApplicationResult.bulkCreate(dbResults, {
                    ignoreDuplicates: true, // Skip duplicates silently
                    validate: true,
                    returning: true
                });

                const duplicatesSkipped = dbResults.length - savedResults.length;

                if (duplicatesSkipped > 0) {
                    addLog(`⚠️  Duplicate company URLs detected: ${duplicatesSkipped} record(s) skipped`, 'warning');
                    addLog(`   Previous applications exist for these companies`, 'info');
                }

                if (savedResults.length > 0) {
                    addLog(`✅ Successfully saved ${savedResults.length} new result(s) to database`, 'success');
                } else {
                    addLog(`ℹ️  No new results to save (all were duplicates)`, 'info');
                }
            } catch (dbError) {
                // Check for duplicate key error specifically
                if (dbError.name === 'SequelizeUniqueConstraintError') {
                    addLog(`⚠️  Some records already exist in database, continuing...`, 'warning');
                } else {
                    addLog(`⚠️  Unable to save results to database. Your applications were successful but may not appear in history.`, 'warning');
                }
            }
        }

        // ========== FINAL SUMMARY ==========
        addLog('', 'info');
        addLog('========================================', 'info');
        addLog('📊 AUTOMATION SUMMARY', 'success');
        addLog('========================================', 'info');
        addLog(`✅ Jobs Applied: ${totalJobsApplied}`, 'success');
        addLog(`⏭️  Jobs Skipped: ${totalJobsSkipped}`, 'warning');
        addLog(`📈 Total Jobs Processed: ${totalJobsApplied + totalJobsSkipped}`, 'info');

        if (Object.keys(skipReasons).length > 0) {
            addLog('', 'info');
            addLog('Skip Breakdown:', 'info');
            for (const [reason, count] of Object.entries(skipReasons)) {
                addLog(`   • ${reason}: ${count}`, 'warning');
            }
        }

        addLog('========================================', 'info');
        addLog('Automation complete!', 'success');

        return {
            success: true,
            jobsApplied: totalJobsApplied,
            jobsSkipped: totalJobsSkipped,
            skipReasons: skipReasons,
            totalProcessed: totalJobsApplied + totalJobsSkipped,
            logs: automationLogs,
        };
    } catch (error) {
        addLog(`Fatal error: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message,
            logs: automationLogs,
        };
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (e) {
                // ignore close errors
            }
        }
        isRunning = false;
    }
}

/**
* Stop the currently running automation
* Forcefully closes the browser and clears all state
*/
export async function stopAutomation() {
    if (!isRunning) {
        addLog('No automation running', 'warning');
        return;
    }

    isRunning = false;
    addLog('⚠️ Stopping automation - killing all processes...', 'warning');

    // Force close browser immediately
    if (browser) {
        try {
            addLog('🔪 Closing browser and all tabs...', 'info');

            // Close all pages first
            try {
                const pages = await browser.pages();
                for (const page of pages) {
                    try {
                        await page.close();
                    } catch (e) {
                        // Ignore errors on individual page close
                    }
                }
            } catch (e) {
                // Ignore if can't get pages
            }

            // Get browser process PID before closing (if available)
            let browserPid = null;
            try {
                const browserProcess = browser.process();
                if (browserProcess && browserProcess.pid) {
                    browserPid = browserProcess.pid;
                }
            } catch (e) {
                // Ignore if process() not available
            }

            // Close browser gracefully
            await browser.close();

            // Force kill browser process if we have PID
            if (browserPid) {
                try {
                    process.kill(browserPid, 'SIGTERM');
                    addLog('🔪 Browser process killed (SIGTERM)', 'info');
                } catch (e) {
                    // Process might already be dead, ignore
                }
            }

            browser = null;
            addLog('✅ Browser closed successfully', 'success');
        } catch (err) {
            addLog(`⚠️ Error closing browser: ${err.message}`, 'error');

            // Force kill browser process if graceful close failed
            try {
                const browserProcess = browser.process();
                if (browserProcess && browserProcess.pid) {
                    process.kill(browserProcess.pid, 'SIGKILL');
                    addLog('🔪 Browser process force killed (SIGKILL)', 'warning');
                }
            } catch (e) {
                // Ignore errors
            }

            // Clear browser reference
            browser = null;
        }
    }

    addLog('✅ All automation processes stopped successfully', 'success');
}

/**
* Get current logs
* @returns {Array} Array of log entries
*/
export function getLogs() {
    return automationLogs;
}

/**
* Clear logs
*/
export function clearLogs() {
    automationLogs = [];
    addLog('Logs cleared', 'info');
}

/**
* Check if automation is running
* @returns {boolean} Whether automation is running
*/
export function isAutomationRunning() {
    return isRunning;
}

/**
* Force reset automation state (for debugging/recovery)
* @returns {boolean} Success status
*/
export function resetAutomationState() {
    isRunning = false;
    automationLogs = [];
    jobResults = [];
    if (browser) {
        browser.close().catch(() => { });
        browser = null;
    }
    addLog('Automation state force reset', 'info');
    return true;
}


/* ======================== CHATBOT RADIO HANDLER (ADDED) ======================== */

async function handleRadioButtons(page, userId = null) {
    try {
        const radioSelector = '.ssrc__radio';

        const radios = await page.$$(radioSelector);
        if (!radios || radios.length === 0) {
            return false;
        }

        addLog(`Found ${radios.length} radio options`, 'info');

        // Extract radio labels
        const radioData = await page.evaluate(() => {
            const inputs = document.querySelectorAll('.ssrc__radio');
            return Array.from(inputs).map((input, index) => {
                const label = document.querySelector(`label[for="${input.id}"]`);
                return {
                    index,
                    value: input.value,
                    label: label ? label.innerText.trim() : input.value
                };
            });
        });

        addLog(`Radio options: ${radioData.map(r => r.label).join(', ')}`, 'info');

        let selectedIndex = null;

        if (userId) {
            const prefs = await fetchUserPreferences(userId);

            // 🔹 Location / Relocation Question
            const questionText = await page.$eval(
                '.botItem .botMsg span',
                el => el.innerText.toLowerCase()
            );

            if (questionText.includes('relocate') || questionText.includes('residing')) {
                if (prefs.location) {
                    selectedIndex = radioData.findIndex(r =>
                        r.label.toLowerCase().includes('yes')
                    );
                }
            }
        }

        // 🔹 Default fallback
        if (selectedIndex === null || selectedIndex === -1) {
            selectedIndex = radioData.findIndex(r =>
                r.label.toLowerCase().includes('yes')
            );
        }

        // 🔹 Final fallback → Skip
        if (selectedIndex === -1) {
            selectedIndex = radioData.findIndex(r =>
                r.label.toLowerCase().includes('skip')
            );
        }

        // Absolute fallback → first option
        if (selectedIndex === -1) selectedIndex = 0;

        await radios[selectedIndex].click();
        await delay(300);

        addLog(`✓ Radio selected: ${radioData[selectedIndex].label}`, 'success');

        return true;
    } catch (err) {
        addLog(`Radio handler error: ${err.message}`, 'warning');
        return false;
    }
}
