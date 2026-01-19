/**
 * ======================== LOCAL NAUKRI AUTOMATION ========================
 * Runs Puppeteer automation locally in Electron with VISIBLE browser
 * User can see the automation happening in real-time
 * No AWS server needed - runs entirely on user's computer
 */

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Global state
let browser = null;
let isRunning = false;

// User data for AI answers (loaded from AWS)
let userAnswersData = null;
let skillsData = [];

/**
 * Delay helper
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate intelligent answer for chatbot question
 * Uses pattern matching based on user data from database
 */
function getIntelligentAnswer(question) {
    if (!question || !userAnswersData) {
        return "Yes, I'm interested";
    }

    const lowerQuestion = question.toLowerCase();

    // Check for city residence questions
    const residingPattern = /(?:residing|living|staying|located|reside|live|stay)\s+(?:in|at)\s+([a-zA-Z\s]+?)(?:\?|$)/i;
    const residingMatch = question.match(residingPattern);

    if (residingMatch && userAnswersData.location) {
        const askedCity = residingMatch[1].trim().toLowerCase();
        const storedLocation = userAnswersData.location.toLowerCase();
        if (storedLocation.includes(askedCity) || askedCity.includes(storedLocation)) {
            return 'Yes';
        } else {
            return 'No';
        }
    }

    // Pattern matching for common questions
    const patterns = {
        // Experience
        experience: () => userAnswersData.yearsOfExperience ? `${userAnswersData.yearsOfExperience} years` : null,
        totalexperience: () => userAnswersData.yearsOfExperience ? `${userAnswersData.yearsOfExperience} years` : null,

        // Location
        location: () => userAnswersData.location || null,
        city: () => userAnswersData.location || null,

        // Notice Period
        notice: () => userAnswersData.noticePeriod || null,
        noticeperiod: () => userAnswersData.noticePeriod || null,
        joining: () => userAnswersData.noticePeriod || null,

        // Salary
        currentsalary: () => userAnswersData.currentCTC || null,
        salary: () => userAnswersData.currentCTC || null,
        currentctc: () => userAnswersData.currentCTC || null,
        ctc: () => userAnswersData.currentCTC || null,

        expectedsalary: () => userAnswersData.expectedCTC || null,
        expectedctc: () => userAnswersData.expectedCTC || null,
        expectation: () => userAnswersData.expectedCTC || null,

        // Availability
        availability: () => userAnswersData.availability || null,
        facetoface: () => userAnswersData.availability || null,
        meeting: () => userAnswersData.availability || null,

        // Name
        name: () => userAnswersData.name || null,
        fullname: () => userAnswersData.name || null,
    };

    // Try to find matching pattern
    for (const [key, answerFn] of Object.entries(patterns)) {
        if (lowerQuestion.includes(key)) {
            const answer = answerFn();
            if (answer) {
                return answer;
            }
        }
    }

    // Default fallback
    return "Yes, I'm interested";
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
 * Auto-scroll page
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
 * Handle chatbot checkbox questions
 */
async function handleCheckBox(page, addLog) {
    try {
        const checkboxSelector = ".checkBoxContainer input[type='radio'], .checkBoxContainer input[type='checkbox']";
        const checkboxes = await page.$$(checkboxSelector);

        if (!checkboxes || checkboxes.length === 0) {
            return false;
        }

        addLog(`Found ${checkboxes.length} checkbox options`, 'info');

        // Get checkbox data
        const checkboxData = await page.evaluate((selector) => {
            const inputs = document.querySelectorAll(selector);
            return Array.from(inputs).map((input, index) => {
                let labelText = '';
                if (input.id) {
                    const label = document.querySelector(`label[for="${input.id}"]`);
                    if (label) labelText = label.innerText.trim();
                }
                if (!labelText) {
                    const parent = input.closest('.checkBoxContainer') || input.parentElement;
                    if (parent) {
                        labelText = Array.from(parent.childNodes)
                            .filter(node => node.nodeType === Node.TEXT_NODE ||
                                (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'INPUT'))
                            .map(node => node.textContent)
                            .join(' ')
                            .trim();
                    }
                }
                return {
                    index: index,
                    label: labelText,
                    value: input.value || '',
                    type: input.type
                };
            });
        }, checkboxSelector);

        addLog(`Checkbox options: ${checkboxData.map(c => c.label || c.value).join(', ')}`, 'info');

        // Select first option (simple strategy for local automation)
        const selectedIndex = 0;

        try {
            await checkboxes[selectedIndex].click();
            await delay(300);
            addLog(`Clicked checkbox: ${checkboxData[selectedIndex].label || checkboxData[selectedIndex].value}`, 'success');
        } catch (err) {
            addLog(`Failed to click checkbox: ${err.message}`, 'warning');
        }

        await delay(500);
        return true;

    } catch (err) {
        addLog(`Checkbox handler error: ${err.message}`, 'error');
        return false;
    }
}

/**
 * Handle chatbot questions
 */
async function handleChatbot(jobPage, addLog) {
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

                // Try checkbox
                const checkboxHandled = await handleCheckBox(jobPage, addLog);
                if (checkboxHandled) {
                    addLog('Checkbox question auto-answered', 'success');
                    const nextBtn = await jobPage.$('.sendMsg');
                    if (nextBtn) await nextBtn.click();
                    continue;
                }

                // Intelligent answer using user data
                const intelligentAnswer = getIntelligentAnswer(q);
                addLog(`Answer: ${intelligentAnswer}`, 'success');

                const inputSelector = ".textArea[contenteditable='true']";
                const exists = await jobPage.$(inputSelector);
                if (!exists) {
                    addLog('Chat input not found, skipping this question', 'warning');
                    continue;
                }

                await jobPage.focus(inputSelector);
                await jobPage.evaluate((sel, answer) => {
                    const el = document.querySelector(sel);
                    if (el) {
                        el.innerText = answer;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, inputSelector, intelligentAnswer);

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
 * Scrape job details
 */
async function scrapeJobDetails(jobPage) {
    try {
        const jobDetails = await jobPage.evaluate(() => {
            const getText = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.innerText.trim() : null;
            };

            const jobTitle = getText('h1.styles_jd-header-title__rZwM1');
            const companyName = getText('.styles_jd-header-comp-name__MvqAI > a');
            const location = getText('.styles_jhc__location__W_pVs a');
            const salary = getText('.styles_jhc__salary__jdfEC span');

            return {
                jobTitle,
                companyName,
                location,
                salary
            };
        });

        return jobDetails;
    } catch (error) {
        return {
            jobTitle: null,
            companyName: null,
            location: null,
            salary: null
        };
    }
}

/**
 * Main automation function - runs locally in Electron
 */
export async function runNaukriAutomation(config, onLog = () => {}) {
    const {
        naukriEmail,
        naukriPassword,
        searchKeywords = 'Software Engineer',
        maxPages = 5,
        jobUrl = null,
        userSettings = null  // User data from AWS database
    } = config;

    // Load user data for intelligent answers
    if (userSettings) {
        // Normalize years of experience
        let normalizedYears = userSettings.yearsOfExperience;
        if (!normalizedYears || normalizedYears === 'Not specified' || normalizedYears === '0') {
            // Try to extract from resume text if available
            if (userSettings.resumeText) {
                const match = userSettings.resumeText.match(/(\d+)\s*\+?\s*years?/i);
                if (match) {
                    normalizedYears = match[1];
                }
            }
        }

        userAnswersData = {
            ...userSettings,
            yearsOfExperience: normalizedYears || '0',
            // Ensure name field exists
            name: userSettings.name || userSettings.fullName || 'User'
        };

        console.log('✅ User data loaded for AI answers:', {
            name: userAnswersData.name,
            location: userAnswersData.location,
            experience: normalizedYears
        });
    }

    if (isRunning) {
        return {
            success: false,
            error: 'Automation already running'
        };
    }

    isRunning = true;
    const logs = [];
    let totalJobsApplied = 0;

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
        addLog('🖥️  Starting Naukri automation LOCALLY in Electron...', 'info');
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
        browser = await puppeteer.launch(browserConfig);

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

        // Determine job URL
        let finalJobUrl = jobUrl;
        if (!finalJobUrl) {
            finalJobUrl = `https://www.naukri.com/${searchKeywords.toLowerCase().replace(/ /g, '-')}-jobs?k=${encodeURIComponent(searchKeywords)}`;
            addLog(`Using search keywords: ${searchKeywords}`, 'info');
        }

        // Process job pages
        let currentPage = 1;

        while (currentPage <= maxPages && isRunning) {
            let pageUrl = finalJobUrl;
            if (currentPage > 1) {
                const urlParts = finalJobUrl.split('-jobs');
                pageUrl = `${urlParts[0]}-jobs-${currentPage}${urlParts[1] || ''}`;
            }

            addLog(`Opening Page ${currentPage}/${maxPages}`, 'info');
            const pageLoaded = await safeGoto(page, pageUrl);
            if (!pageLoaded) {
                addLog('Skipping this page due to loading issues...', 'warning');
                currentPage++;
                continue;
            }

            await autoScroll(page);
            await delay(1000);

            // Find job links
            let jobLinks = [];
            const jobLinkSelectors = [
                'a.title',
                '.jobTuple a.title',
                'article[data-job-id] a',
            ];

            for (const selector of jobLinkSelectors) {
                try {
                    const links = await page.$$eval(selector, elements =>
                        elements
                            .map(a => a.href)
                            .filter(x => typeof x === 'string' && x.includes('job-listings'))
                    );

                    if (links.length > 0) {
                        jobLinks = [...new Set(links)];
                        addLog(`Found ${jobLinks.length} jobs on page ${currentPage}`, 'info');
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            // Process each job
            for (let i = 0; i < jobLinks.length && isRunning; i++) {
                const link = jobLinks[i];
                addLog(`Opening job ${i + 1}/${jobLinks.length}`, 'info');

                const jobPage = await browser.newPage();
                try {
                    await jobPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
                } catch (navError) {
                    addLog(`Failed to load job page: ${navError.message}`, 'warning');
                    await jobPage.close();
                    continue;
                }
                await delay(2000);

                // Check if stopped
                if (!isRunning) {
                    await jobPage.close();
                    break;
                }

                // Scrape details
                const jobDetails = await scrapeJobDetails(jobPage);
                if (jobDetails.jobTitle) {
                    addLog(`Job: ${jobDetails.jobTitle} at ${jobDetails.companyName || 'Unknown'}`, 'info');
                }

                // Check apply button
                const externalApply = await jobPage.$('#company-site-button');
                const applyBtn = await jobPage.$('#apply-button');

                if (externalApply || !applyBtn) {
                    addLog('Skipping job (external apply or no button)', 'warning');
                    await jobPage.close();
                    await delay(1000);
                    continue;
                }

                // Apply
                addLog('Clicking apply button...', 'info');
                await applyBtn.click();
                await delay(5000);

                // Handle chatbot
                await handleChatbot(jobPage, addLog);

                totalJobsApplied++;
                addLog(`✅ Job application submitted! Total applied: ${totalJobsApplied}`, 'success');

                await jobPage.close();
                await delay(2000); // Delay between applications
            }

            currentPage++;
        }

        // Summary
        addLog('', 'info');
        addLog('========================================', 'info');
        addLog('📊 AUTOMATION COMPLETE', 'success');
        addLog('========================================', 'info');
        addLog(`✅ Jobs Applied: ${totalJobsApplied}`, 'success');
        addLog('========================================', 'info');

        return {
            success: true,
            jobsApplied: totalJobsApplied,
            logs,
            message: `Successfully applied to ${totalJobsApplied} jobs`
        };

    } catch (error) {
        addLog(`Fatal error: ${error.message}`, 'error');
        return {
            success: false,
            jobsApplied: totalJobsApplied,
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
 * Stop automation
 */
export async function stopAutomation() {
    if (!isRunning) {
        return { success: false, message: 'No automation running' };
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

    return { success: true, message: 'Automation stopped' };
}
